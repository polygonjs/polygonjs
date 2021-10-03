/**
 * Creates a texture mesh representing a face from a webcam feed
 *
 * @remarks
 *
 * code insired from https://codepen.io/mediapipe/pen/KKgVaPJ
 */

import {FaceMesh, Results, FACEMESH_TESSELATION} from '@mediapipe/face_mesh';
import {TypedSopNode} from './_Base';
import {WebCamCopNode} from '../cop/WebCam';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {Mesh} from 'three/src/objects/Mesh';
import {ObjectType} from '../../../core/geometry/Constant';
import {BaseNodeType} from '../_Base';
import {Texture} from 'three/src/textures/Texture';
import {CoreType} from '../../../core/Type';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {sRGBEncoding} from 'three/src/constants';
import {CoreSleep} from '../../../core/Sleep';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {VideoCopNode} from '../cop/Video';

const FACEMESH_POINTS_COUNT = 468;
const ALLOWED_COP_TYPES = [CopType.VIDEO, CopType.WEB_CAM];
type AllowedCopType = WebCamCopNode | VideoCopNode;

type WebCamSnapshotResolve = (value: void | PromiseLike<void>) => void;
interface TextureAndImage {
	texture: Texture;
	image: HTMLImageElement;
}

class MediapipeFaceMeshSopParamsConfig extends NodeParamsConfig {
	/** @param webcam node */
	webcam = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
			types: ALLOWED_COP_TYPES,
		},
	});
	/** @param scale */
	scale = ParamConfig.FLOAT(2, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param selfie mode */
	selfieMode = ParamConfig.BOOLEAN(0);
	/** @param min detection confidence */
	minDetectionConfidence = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param max detection confidence */
	maxDetectionConfidence = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param number of frames that will be captured */
	frames = ParamConfig.INTEGER(1, {
		range: [1, 100],
		rangeLocked: [true, false],
	});
	/** @param frames per second */
	fps = ParamConfig.INTEGER(24, {
		range: [1, 60],
		rangeLocked: [true, false],
	});
	/** @param capture */
	capture = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			MediapipeFaceMeshSopNode.PARAM_CALLBACK_capture(node as MediapipeFaceMeshSopNode);
		},
	});
	/** @param show all meshes */
	showAllMeshes = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MediapipeFaceMeshSopParamsConfig();

export class MediapipeFaceMeshSopNode extends TypedSopNode<MediapipeFaceMeshSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'mediapipeFaceMesh';
	}

	private _faceMesh = this._createFaceMesh();
	private _currentCapturedFrame = 9999999;
	private _webcamSnapshotCanvases: HTMLCanvasElement[] = [];
	private _webcamSnapshots: TextureAndImage[] = [];
	private _faceMeshObjects: Mesh[] = [];

	initializeNode() {
		this._forceTimeDependent();
	}
	private _graph_node: CoreGraphNode | undefined;
	private _forceTimeDependent() {
		if (!this._graph_node) {
			this._graph_node = new CoreGraphNode(this.scene(), 'facemesh_update_object');
			this._graph_node.addGraphInput(this.scene().timeController.graphNode);
			this._graph_node.addPostDirtyHook('on_time_change', this.setDirty.bind(this));
		}
	}

	async cook() {
		if (isBooleanTrue(this.pv.showAllMeshes)) {
			this.setObjects(this._faceMeshObjects);
		} else {
			const frame = this.scene().frame() % this._faceMeshObjects.length;
			const currentObject = this._faceMeshObjects[frame];
			if (currentObject) {
				this.setObject(currentObject);
			} else {
				this.setObjects([]);
			}
		}
	}

	private _createFaceMesh() {
		const faceMesh = new FaceMesh({
			locateFile: (file: string) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`;
			},
		});
		faceMesh.onResults(this._onResults.bind(this));
		return faceMesh;
	}

	private async _getHTMLVideoElement() {
		const node = this.pv.webcam.nodeWithContext(NodeContext.COP);
		if (!node) {
			this.states.error.set(`node is not a COP node`);
			this.cookController.endCook();
			return;
		}
		if (!ALLOWED_COP_TYPES.includes(node.type() as CopType)) {
			this.states.error.set(
				`node type '${node.type()}' is not accepted by MediapipeFaceMesh (${ALLOWED_COP_TYPES.join(', ')})`
			);
			this.cookController.endCook();
			return;
		}
		const webcamNode = node as AllowedCopType;
		await webcamNode.compute();
		const videoElement = webcamNode.HTMLVideoElement();
		if (!videoElement) {
			console.log('no video element found');
			return;
		}
		return {videoElement};
	}

	private _videoSnapshotCanvas(videoElement: HTMLVideoElement) {
		const canvasElement = document.createElement('canvas');
		// videoWidth and videoHeight are more robust than .width and .height (see https://discourse.threejs.org/t/how-to-get-camera-video-texture-size-or-resolution/2879)
		canvasElement.width = videoElement.videoWidth;
		canvasElement.height = videoElement.videoHeight;
		const canvasCtx = canvasElement.getContext('2d')!;
		canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
		return canvasElement;
	}
	private static _canvasToTexture(canvasElement: HTMLCanvasElement, index: number): Promise<TextureAndImage> {
		return new Promise((resolve) => {
			const imgDataURL = canvasElement.toDataURL('image/png');
			const image = new Image();
			console.log(`start ${index}`);
			image.onload = () => {
				const texture = new Texture(image);
				texture.name = `facemesh-texture-${index}`;
				texture.encoding = sRGBEncoding;
				texture.needsUpdate = true;
				console.log(`done ${index}`);
				resolve({texture, image});
			};
			image.src = imgDataURL;
		});
	}

	private _activeHTMLVideoElement: HTMLVideoElement | undefined;
	private async _initActiveHTMLVideoElement() {
		const data = await this._getHTMLVideoElement();
		if (!data) {
			return;
		}
		const {videoElement} = data;
		while (videoElement.paused) {
			console.log('video is paused');
			await CoreSleep.sleep(500);
		}
		this._activeHTMLVideoElement = videoElement;
	}

	private _captureAllowed() {
		return this._currentCapturedFrame < this.pv.frames;
	}
	private async _capture() {
		// 1. capture video feed into images
		// so that we have the expected fps
		console.log('capture start');
		await this._initActiveHTMLVideoElement();
		this._currentCapturedFrame = 0;
		await this._captureWebCamSnapshots();
		console.log('capture complete');

		// 2. init face meshes
		this._initFaceMeshObjects();

		// 3. send the captured images to mediapipe
		// which will then be processed to create the meshes
		this._currentCapturedFrame = 0;
		await this._sendToFaceMeshAll();

		console.log('facemesh generation completed');

		return;
	}

	private _captureWebCamSnapshots(): Promise<void> {
		return new Promise((resolve) => {
			this._webcamSnapshotCanvases = [];
			this._webcamSnapshots = [];
			this._captureSingleWebCamSnapshot(resolve);
		});
	}
	private async _captureSingleWebCamSnapshot(resolve: WebCamSnapshotResolve) {
		if (!this._activeHTMLVideoElement) {
			console.log('no video found');
			return;
		}
		if (!this._captureAllowed()) {
			console.log('converting snapshots to images and textures...');
			let i = 0;
			for (let snapshotCanvas of this._webcamSnapshotCanvases) {
				const snapshot = await MediapipeFaceMeshSopNode._canvasToTexture(snapshotCanvas, i);
				this._webcamSnapshots.push(snapshot);
				i++;
			}

			resolve();
		} else {
			const canvas = this._videoSnapshotCanvas(this._activeHTMLVideoElement);
			this._webcamSnapshotCanvases.push(canvas);
			this._currentCapturedFrame++;
			console.log('capture', this._currentCapturedFrame);
			setTimeout(() => {
				this._captureSingleWebCamSnapshot(resolve);
			}, 1000 / this.pv.fps);
		}
	}

	private _initFaceMeshObjects() {
		this._faceMeshObjects = [];
		const count = this.pv.frames;
		for (let i = 0; i < count; i++) {
			const object = this._createFaceMeshObject(i);
			this._faceMeshObjects.push(object);
		}
	}

	private _onSendToFaceMeshSingleResolve: WebCamSnapshotResolve | undefined;
	private async _sendToFaceMeshAll() {
		this._faceMesh.setOptions({
			enableFaceGeometry: true,
			selfieMode: this.pv.selfieMode,
			maxNumFaces: 1,
			minDetectionConfidence: this.pv.minDetectionConfidence,
			minTrackingConfidence: this.pv.maxDetectionConfidence,
		});

		for (let snapshot of this._webcamSnapshots) {
			await this._sendToFaceMeshSingle(snapshot);
		}
	}
	private _sendToFaceMeshSingle(snapshot: TextureAndImage) {
		return new Promise((resolve) => {
			this._onSendToFaceMeshSingleResolve = resolve;
			this._faceMesh.send({image: snapshot.image});
		});
	}

	private _onResults(results: Results) {
		if (!this._captureAllowed()) {
			return;
		}
		console.log(this._currentCapturedFrame);
		const landmark = results.multiFaceLandmarks[0];
		if (!landmark) {
			console.error(`no landmark found (${this._currentCapturedFrame})`);
			console.log('results', results);
			return;
		}
		const faceMeshObject = this._faceMeshObjects[this._currentCapturedFrame];
		let i = 0;
		const positionAttribute = faceMeshObject.geometry.getAttribute('position');
		const uvAttribute = faceMeshObject.geometry.getAttribute('uv');
		const positionArray = positionAttribute.array as number[];
		const uvArray = uvAttribute.array as number[];
		const scale = this.pv.scale;
		for (let pt of landmark) {
			positionArray[i * 3 + 0] = (1 - pt.x) * scale;
			positionArray[i * 3 + 1] = (1 - pt.y) * scale;
			positionArray[i * 3 + 2] = pt.z * scale;
			uvArray[i * 2 + 0] = pt.x;
			uvArray[i * 2 + 1] = 1 - pt.y;
			i++;
		}
		positionAttribute.needsUpdate = true;
		uvAttribute.needsUpdate = true;
		this._updateMaterial(this._currentCapturedFrame);
		this._currentCapturedFrame++;
		if (this._onSendToFaceMeshSingleResolve) {
			this._onSendToFaceMeshSingleResolve();
		}
	}
	private _updateMaterial(currentCapturedFrame: number) {
		const faceMeshObject = this._faceMeshObjects[currentCapturedFrame];
		const material = faceMeshObject.material;
		if (!CoreType.isArray(material)) {
			const meshBasicMaterial = material as MeshBasicMaterial;
			const texture = this._webcamSnapshots[currentCapturedFrame].texture;
			meshBasicMaterial.map = texture;
			meshBasicMaterial.needsUpdate = true;
		}
	}

	private _createFaceMeshObject(index: number) {
		const geometry = new BufferGeometry();
		const positions: number[] = [];
		const uvs: number[] = [];

		for (let i = 0; i < FACEMESH_POINTS_COUNT; i++) {
			positions.push(i);
			positions.push(i);
			positions.push(i);
			uvs.push(i);
			uvs.push(i);
		}
		const indices: number[] = [];
		const polyCount = FACEMESH_TESSELATION.length / 3;
		for (let i = 0; i < polyCount; i++) {
			indices.push(FACEMESH_TESSELATION[i * 3 + 0][0]);
			indices.push(FACEMESH_TESSELATION[i * 3 + 1][0]);
			indices.push(FACEMESH_TESSELATION[i * 3 + 2][0]);
		}
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
		geometry.setIndex(indices);
		const object = this.createObject(geometry, ObjectType.MESH, new MeshBasicMaterial());
		object.name = `${this.path()}-${index}`;
		return object;
	}

	static PARAM_CALLBACK_capture(node: MediapipeFaceMeshSopNode) {
		node._paramCallbackCapture();
	}
	private _paramCallbackCapture() {
		this._capture();
	}
}
