import {
	Line,
	LineBasicMaterial,
	Material,
	Matrix4,
	Mesh,
	Object3D,
	WebGLCapabilities,
	WebGLMultipleRenderTargets,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import {Scene, Camera, MeshBasicMaterial} from 'three';
import {FullScreenQuad} from '../../../../../modules/three/examples/jsm/postprocessing/Pass';
import {AbstractRenderer} from '../../../../viewers/Common';
// @ts-ignore
import type {PathTracingRenderer} from 'three-gpu-pathtracer';
// @ts-ignore
import {DynamicPathTracingSceneGenerator} from 'three-gpu-pathtracer';
import {CoreType} from '../../../../../core/Type';
import {CoreSleep} from '../../../../../core/Sleep';
// @ts-ignore
import {PathTracingSceneWorker} from 'three-gpu-pathtracer/src/workers/PathTracingSceneWorker.js';
type OnSampleCompleted = () => void;
type OnFrameCompleted = () => Promise<void>;
type SleepCallback = (duration: number) => Promise<void>;
type TimeoutCallback = () => void;
type SetTimeoutCallback = (callback: TimeoutCallback, duration: number) => void;
type RequestAnimationFrame = (callback: TimeoutCallback) => number;

interface RecordingStateOptions {
	isRecording: boolean;
	onSampleCompleted?: OnSampleCompleted;
	onFrameCompleted?: OnFrameCompleted;
	sleepCallback?: SleepCallback;
	setTimeout?: SetTimeoutCallback;
	requestAnimationFrame?: RequestAnimationFrame;
}
const USE_DYNAMIC_GENERATOR = false;

export class PathTracingRendererContainer implements AbstractRenderer {
	public displayDebug = true;
	public samplesPerFrame = 1;
	public samplesPerAnimationFrame = 1;
	public resolutionScale = 0.5;
	public domElement: HTMLCanvasElement;
	private _generated = false;
	private _generating = false;
	public readonly isPathTracingRendererContainer = true;
	private _isRecording = false;
	protected _onSampleCompleted: OnSampleCompleted | undefined;
	private _onFrameCompleted: OnFrameCompleted | undefined;
	private _sleepCallback: SleepCallback | undefined;
	private _setTimeout: SetTimeoutCallback | undefined;
	private _requestAnimationFrame: RequestAnimationFrame | undefined;

	constructor(
		public webGLRenderer: WebGLRenderer,
		public pathTracingRenderer: PathTracingRenderer,
		public fsQuad: FullScreenQuad,
		public fsQuadMat: MeshBasicMaterial
	) {
		this.domElement = this.webGLRenderer.domElement;
	}
	async sleep(duration: number) {
		// console.log('sleep', duration, this._sleepCallback);
		if (this._sleepCallback) {
			await this._sleepCallback(duration);
		} else {
			await CoreSleep.sleep(duration);
		}
	}
	setTimeout(callback: TimeoutCallback, duration: number) {
		// console.log('setTimeout', duration, this._setTimeout, callback);
		if (this._setTimeout) {
			const _setTimeout = this._setTimeout;
			_setTimeout(callback, duration);
		} else {
			setTimeout(callback, duration);
		}
	}
	requestAnimationFrame(callback: TimeoutCallback) {
		if (this._requestAnimationFrame) {
			const _requestAnimationFrame = this._requestAnimationFrame;
			return _requestAnimationFrame(callback);
		} else {
			return requestAnimationFrame(callback);
		}
	}
	setRecordingState(options: RecordingStateOptions) {
		this._isRecording = options.isRecording;
		this._onSampleCompleted = options.onSampleCompleted;
		this._onFrameCompleted = options.onFrameCompleted;
		this._sleepCallback = options.sleepCallback;
		this._setTimeout = options.setTimeout;
		this._requestAnimationFrame = options.requestAnimationFrame;

		// this.render = this._isRecording ? this.renderRecording.bind(this) : this.renderRealtime.bind(this);
		// console.log('switch', this._isRecording, this.render);
	}
	// render = this.renderRealtime.bind(this);
	async render(scene: Scene, camera: Camera) {
		if (this._isRecording) {
			await this.renderRecording(scene, camera);
		} else {
			await this.renderRealtime(scene, camera);
		}
	}
	async renderRecording(scene: Scene, camera: Camera) {
		while (this._generating) {
			await this.sleep(50);
		}
		// this.reset();
		await this.generate(scene, true);

		this._preRender(camera);
		this.pathTracingRenderer.reset();

		const maxCount = this.samplesPerAnimationFrame;
		for (let i = 0; i < maxCount; i++) {
			this.pathTracingRenderer.update();
			// this._postRender();
			if (this._onSampleCompleted) {
				this._onSampleCompleted();
			}
			// if (i % 10 == 0) {
			await this.sleep(20);
			// }
		}
		this._postRender();
		if (this._onFrameCompleted) {
			await this._onFrameCompleted();
		}
		// await CoreSleep.sleep(10);
	}
	async renderRealtime(scene: Scene, camera: Camera) {
		if (this._generating) {
			this.webGLRenderer.render(scene, camera);
			return;
		} else {
			if (!this._generated) {
				// this.generate(scene);
				this.webGLRenderer.render(scene, camera);
				return;
			}
		}
		this._preRender(camera);

		const maxCount = this.samplesPerFrame;
		for (let i = 0; i < maxCount; i++) {
			this.pathTracingRenderer.update();
			await this.sleep(1);
		}

		if (this.pathTracingRenderer.samples < 1) {
			this.webGLRenderer.render(scene, camera);
		}

		this._postRender();

		if (this._onFrameCompleted) {
			this._onFrameCompleted();
		}
		// console.log('samples:', Math.floor(this.pathTracingRenderer.samples));
	}
	private _preRender(camera: Camera) {
		this.pathTracingRenderer.camera = camera;
		camera.updateMatrixWorld();
		this._resetIfCameraUpdated(camera);
	}
	private _postRender() {
		this.webGLRenderer.autoClear = false;
		this.fsQuadMat.map = this.pathTracingRenderer.target.texture;
		this.fsQuad.render(this.webGLRenderer);
		this.webGLRenderer.autoClear = true;
	}
	samplesCount() {
		return Math.floor(this.pathTracingRenderer.samples);
	}
	getPixelRatio() {
		return this.webGLRenderer.getPixelRatio();
	}
	compile(scene: Scene, camera: Camera) {
		return this.webGLRenderer.compile(scene, camera);
	}
	dispose(): void {
		this.webGLRenderer.dispose();
		this.pathTracingRenderer.dispose();
		this.fsQuadMat.dispose();
	}
	setSize(w: number, h: number, setStyle: boolean) {
		this.webGLRenderer.setSize(w, h, setStyle);

		this.pathTracingRenderer.setSize(
			w * this.resolutionScale * window.devicePixelRatio,
			h * this.resolutionScale * window.devicePixelRatio
		);
		this.pathTracingRenderer.reset();
	}
	setRenderTarget(
		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets | null,
		activeCubeFace?: number | undefined,
		activeMipmapLevel?: number | undefined
	) {
		this.webGLRenderer.setRenderTarget(renderTarget, activeCubeFace, activeMipmapLevel);
	}
	readRenderTargetPixels(
		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets,
		x: number,
		y: number,
		width: number,
		height: number,
		buffer: Float32Array,
		activeCubeFaceIndex?: number | undefined
	) {
		return this.webGLRenderer.readRenderTargetPixels(
			renderTarget,
			x,
			y,
			width,
			height,
			buffer,
			activeCubeFaceIndex
		);
	}
	get capabilities(): WebGLCapabilities {
		return this.webGLRenderer.capabilities;
	}

	private _dynamicGenerator: DynamicPathTracingSceneGenerator | undefined;
	private _workerGenerator: DynamicPathTracingSceneGenerator | undefined;
	private _generateRequired = false;
	async generate(scene: Scene, allowWhileRecording = false) {
		if (this._isRecording && allowWhileRecording == false) {
			return;
		}

		if (this._generating) {
			this._generateRequired = true;
			return;
		}
		console.warn('GENERATOR START');
		this._generated = false;
		this._generating = true;

		const _restartIfRequired = () => {
			if (this._generateRequired) {
				this._generateRequired = false;
				this._generating = false;
				console.log('GENERATOR RESTART...');
				const _this = this;
				function generate() {
					_this.generate(scene);
				}
				this.setTimeout(generate, 20);
				return true;
			}
		};

		const bgTexture = scene.environment;
		if (bgTexture) {
			this.pathTracingRenderer.material.envMapInfo.updateFrom(bgTexture);
			await this.sleep(20);
		}

		// try {
		// if (this._generator) {
		// 	this._generator.reset();
		// 	this._generator.dispose();
		// }
		// this._generator.generate(scene, {
		// 	onProgress: (ratio: number) => {
		// 		console.log(ratio);
		// 	},
		// });
		if (_restartIfRequired()) {
			return;
		}
		// scene.traverse((object) => {
		// 	const nonMeshes: Object3D[] = [];
		// 	for (let child of object.children) {
		// 		if ((child as Light).isLight) {
		// 			nonMeshes.push(child);
		// 		}
		// 	}
		// 	for (let nonMesh of nonMeshes) {
		// 		object.remove(nonMesh);
		// 	}
		// });

		// update matrices
		scene.updateMatrixWorld(true);

		// const result = await this._generator.generate(scene);
		// this._generator.reset();
		prepareScene(scene);
		if (USE_DYNAMIC_GENERATOR) {
			this._dynamicGenerator = this._dynamicGenerator || new DynamicPathTracingSceneGenerator(scene);
			this._dynamicGenerator.reset();
		} else {
			this._workerGenerator = this._workerGenerator || new PathTracingSceneWorker();
			// this._workerGenerator.reset();
		}
		const result = USE_DYNAMIC_GENERATOR
			? this._dynamicGenerator.generate()
			: await this._workerGenerator.generate(scene, {
					onProgress: (progress: number) => {
						console.log(progress);
					},
			  });
		restoreScene(scene);
		await this.sleep(20);
		if (_restartIfRequired()) {
			return;
		}
		const {bvh, textures, materials, lights} = result;
		const geometry = bvh.geometry;
		const material = this.pathTracingRenderer.material;
		// console.log('result', result, this._generator, bvh, material);

		material.bvh.updateFrom(bvh);
		material.attributesArray.updateFrom(
			geometry.attributes.normal,
			geometry.attributes.tangent,
			geometry.attributes.uv,
			geometry.attributes.color
		);
		material.materialIndexAttribute.updateFrom(geometry.attributes.materialIndex);
		material.textures.setTextures(this.webGLRenderer, 1024, 1024, textures);
		material.materials.updateFrom(materials, textures);
		// lights
		const iesTextures = lights.map((light: any) => light.iesTexture);
		// console.log({lights, iesTextures});
		material.iesProfiles.updateFrom(this.webGLRenderer, iesTextures);
		material.lights.updateFrom(lights, iesTextures);
		await this.sleep(20);

		// this._generator.dispose();
		// this._generator = undefined;
		if (_restartIfRequired()) {
			return;
		}
		this._generating = false;
		this._generated = true;
		this.reset();
		console.log('GENERATOR DONE');
		// } catch (err) {
		// 	console.log(err);
		// 	this._generating = false;
		// }
	}
	reset() {
		if (!this._generated) {
			return;
		}
		if (this._isRecording) {
			return;
		}
		// console.warn('reset');
		this.pathTracingRenderer.reset();
	}

	private _previousCameraProjectionMatrix: Matrix4 = new Matrix4();
	private _previousCameraWorldMatrix: Matrix4 = new Matrix4();
	private _resetIfCameraUpdated(camera: Camera) {
		if (
			this._previousCameraProjectionMatrix.equals(camera.projectionMatrix) &&
			this._previousCameraWorldMatrix.equals(camera.matrixWorld)
		) {
			return;
		}
		this._previousCameraProjectionMatrix.copy(camera.projectionMatrix);
		this._previousCameraWorldMatrix.copy(camera.matrixWorld);
		this.reset();
	}
}

const previousParent: Map<Object3D, Object3D> = new Map();
function prepareScene(scene: Scene) {
	function _saveAndSetObjectState(object: Object3D) {
		if (!object.parent) {
			return;
		}

		previousParent.set(object, object.parent);
		object.parent.remove(object);
	}
	function _isValidMaterial(material: Material) {
		if (material instanceof LineBasicMaterial) {
			return false;
		}
		if (material instanceof MeshBasicMaterial) {
			return false;
		}
		return true;
	}
	function _isValidObject(object: Object3D) {
		if (object instanceof Line) {
			return false;
		}
		const material = (object as Mesh).material;
		if (CoreType.isArray(material)) {
			for (let mat of material) {
				if (!_isValidMaterial(mat)) {
					return false;
				}
			}
		} else {
			if (!_isValidMaterial(material)) {
				return false;
			}
		}
		return true;
	}

	const objectsToRemoveFromHierarchy: Object3D[] = [];
	scene.traverse((object) => {
		if (!_isValidObject(object)) {
			objectsToRemoveFromHierarchy.push(object);
			// _saveAndSetObjectState(object);
		}
	});
	for (let object of objectsToRemoveFromHierarchy) {
		_saveAndSetObjectState(object);
	}
}

function restoreScene(scene: Scene) {
	previousParent.forEach((parent, object) => {
		parent.add(object);
	});

	previousParent.clear();
}
