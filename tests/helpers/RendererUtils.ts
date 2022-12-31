import {Camera} from 'three';
import {Scene} from 'three';
import {Mesh} from 'three';
import {PerspectiveCamera} from 'three';
import {BaseBuilderMatNodeType} from '../../src/engine/nodes/mat/_BaseBuilder';
import {PerspectiveCameraObjNode} from '../../src/engine/nodes/obj/PerspectiveCamera';
import {ThreejsViewer} from '../../src/engine/viewers/Threejs';
import {BoxGeometry} from 'three';
import {Material} from 'three';
import {PolyScene} from '../../src/engine/scene/PolyScene';
import {TypedViewer} from '../../src/engine/viewers/_Base';
import {OrthographicCameraObjNode} from '../../src/engine/nodes/obj/OrthographicCamera';
import {AbstractRenderer} from '../../src/engine/viewers/Common';
// import {CoreImage} from '../../src/core/Image';

interface RendererConfig {
	canvas: HTMLCanvasElement;
	renderer: AbstractRenderer;
	viewer?: TypedViewer<Camera>;
}

interface WithViewerCallbackArgs {
	viewer: ThreejsViewer<Camera>;
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	renderer?: AbstractRenderer;
}
interface WithViewerOptions {
	viewer?: ThreejsViewer<Camera>;
	cameraNode?: PerspectiveCameraObjNode | OrthographicCameraObjNode;
	mount?: boolean;
}
type WithViewerContainerCallback = (element: HTMLElement) => Promise<void>;
type WithViewerCallback = (args: WithViewerCallbackArgs) => Promise<void>;
export class RendererUtils {
	private static _configs: RendererConfig[] = [];

	static async withViewerContainer(callback: WithViewerContainerCallback) {
		const element = document.createElement('div');
		element.style.position = 'absolute';
		element.style.top = '0px';
		element.style.left = '0px';
		element.style.width = '200px';
		element.style.height = '200px';
		element.style.zIndex = '9999999';
		document.body.appendChild(element);
		await callback(element);
		document.body.removeChild(element);
	}

	static async withViewer(options: WithViewerOptions, callback: WithViewerCallback) {
		await this.withViewerContainer(async (element) => {
			const viewer = (options.viewer || (await options.cameraNode?.createViewer({element})))!;
			const canvas = viewer.canvas();
			const renderer = viewer.renderer();

			let mount = false;
			if (options.mount != null) {
				mount = options.mount;
			}
			if (mount) {
				viewer.mount(element);
			}

			// options.cameraNode.scene().viewersRegister.viewerWithCamera(options.cameraNode)
			await callback({viewer, element, canvas, renderer});

			viewer.dispose();
		});
	}

	static async waitForRenderer(scene: PolyScene): Promise<RendererConfig> {
		return new Promise(async (resolve) => {
			const canvas = document.createElement('canvas');
			document.body.appendChild(canvas);
			// const size = new Vector2(canvas.width, canvas.height);
			// const cameraNode = scene.mainCameraNode();
			// if (!cameraNode) {
			// 	console.warn(`no camera node found in scene '${scene.name()}'`);
			// 	return;
			// }
			const viewer = (await scene.camerasController.createMainViewer())!; //await (cameraNode as PerspectiveCameraObjNode)
			// .renderController()
			// .createRenderer(canvas, size);
			const renderer = await scene.renderersRegister.waitForRenderer();
			if (renderer) {
				const config: RendererConfig = {canvas, viewer, renderer};
				this._configs.push(config);
				resolve(config);
			} else {
				console.error('no renderer from Poly');
			}
		});
	}

	// static readCanvasPixelValue(canvas: HTMLCanvasElement, pos: Vector2): Promise<ImageData> {
	// 	return new Promise((resolve, reject) => {
	// 		canvas.toBlob(async (blob: Blob | null) => {
	// 			const blobToImage: (blob: Blob) => Promise<HTMLImageElement> = (blob: Blob) => {
	// 				return new Promise((resolve) => {
	// 					const url = URL.createObjectURL(blob);
	// 					let img = new Image();
	// 					img.onload = () => {
	// 						URL.revokeObjectURL(url);
	// 						resolve(img);
	// 					};
	// 					img.src = url;
	// 				});
	// 			};
	// 			function downloadBlob(blob: Blob, filename: string) {
	// 				const urlCreator = window.URL || window.webkitURL;
	// 				const blobUrl = urlCreator.createObjectURL(blob);

	// 				const element = document.createElement('a');
	// 				element.setAttribute('href', blobUrl);
	// 				element.setAttribute('target', '_blank');
	// 				element.setAttribute('download', filename);

	// 				element.style.display = 'none';
	// 				document.body.appendChild(element);
	// 				element.click();

	// 				document.body.removeChild(element);
	// 			}

	// 			if (!blob) {
	// 				return reject();
	// 			}
	// 			downloadBlob(blob, 'test.png');
	// 			const img = await blobToImage(blob);
	// 			const data = CoreImage.data_from_image(img);
	// 			return resolve(data);
	// 		});
	// 	});
	// }

	// private static _renderTarget: WebGLRenderTarget | undefined;
	// private static _read = new Float32Array(4);
	// static pixelValue(viewer: ThreejsViewer<Camera>, scene: PolyScene, pos: Vector2) {
	// 	const canvas = viewer.canvas();
	// 	const renderer = viewer.renderer();
	// 	const camera = viewer.camera();
	// 	if (!renderer) {
	// 		console.error('no renderer to run .pixelValue');
	// 		return;
	// 	}
	// 	this._renderTarget =
	// 		this._renderTarget ||
	// 		new WebGLRenderTarget(canvas.offsetWidth, canvas.offsetHeight, {
	// 			minFilter: LinearFilter,
	// 			magFilter: NearestFilter,
	// 			format: RGBAFormat,
	// 			type: FloatType,
	// 		});

	// 	const threejsScene = scene.threejsScene();
	// 	const prevRenderTarget = renderer.getRenderTarget();
	// 	renderer.setRenderTarget(this._renderTarget);
	// 	renderer.clear();
	// 	renderer.render(threejsScene, camera);
	// 	renderer.setRenderTarget(prevRenderTarget);

	// 	console.log(Math.round(pos.x * canvas.offsetWidth), Math.round(pos.y * canvas.offsetHeight));
	// 	// read result
	// 	renderer.readRenderTargetPixels(
	// 		this._renderTarget,
	// 		Math.round(pos.x * canvas.offsetWidth),
	// 		Math.round(pos.y * canvas.offsetHeight),
	// 		1,
	// 		1,
	// 		this._read
	// 	);
	// 	return [this._read[0], this._read[1], this._read[2], this._read[3]];
	// }

	private static _scene = this._createMatCompileScene();
	private static _camera = new PerspectiveCamera();
	private static _mesh = new Mesh();
	static async compile(matNode: BaseBuilderMatNodeType | Material, renderer: AbstractRenderer) {
		let material: Material;
		if (matNode instanceof Material) {
			material = matNode;
		} else {
			material = await matNode.material();
		}
		this._mesh.material = material;
		renderer.compile(this._mesh, this._camera);
	}
	private static _createMatCompileScene(): Scene {
		this._scene = new Scene();
		this._mesh = new Mesh(new BoxGeometry(1, 1, 1));
		this._mesh.frustumCulled = false;
		this._camera = new PerspectiveCamera();
		this._camera.position.z = 5;
		this._camera.updateMatrix();
		this._scene.add(this._mesh);
		this._scene.add(this._camera);
		return this._scene;
	}

	static dispose() {
		let config: RendererConfig | undefined;
		while ((config = this._configs.pop())) {
			config.viewer?.dispose();
			config.canvas.parentElement?.removeChild(config.canvas);
		}
	}
}
