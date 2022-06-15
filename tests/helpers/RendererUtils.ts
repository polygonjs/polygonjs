import {Camera} from 'three';
import {WebGLRenderer} from 'three';
import {Scene} from 'three';
import {Mesh} from 'three';
import {PerspectiveCamera} from 'three';
import {BaseBuilderMatNodeType} from '../../src/engine/nodes/mat/_BaseBuilder';
import {PerspectiveCameraObjNode} from '../../src/engine/nodes/obj/PerspectiveCamera';
import {ThreejsViewer} from '../../src/engine/viewers/Threejs';
import {BoxBufferGeometry} from 'three';
import {Material} from 'three';
import {PolyScene} from '../../src/engine/scene/PolyScene';
import {TypedViewer} from '../../src/engine/viewers/_Base';
import {OrthographicCameraObjNode} from '../../src/engine/nodes/obj/OrthographicCamera';

interface RendererConfig {
	canvas: HTMLCanvasElement;
	renderer: WebGLRenderer;
	viewer?: TypedViewer<Camera>;
}

interface WithViewerCallbackArgs {
	viewer: ThreejsViewer<Camera>;
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	renderer?: WebGLRenderer;
}
interface WithViewerOptions {
	cameraNode: PerspectiveCameraObjNode | OrthographicCameraObjNode;
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
			const viewer = (await options.cameraNode.createViewer({element}))!;
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
				const config = {canvas, viewer, renderer};
				this._configs.push(config);
				resolve(config);
			} else {
				console.error('no renderer from Poly');
			}
		});
	}

	private static _scene = this._createMatCompileScene();
	private static _camera = new PerspectiveCamera();
	private static _mesh = new Mesh();
	static async compile(matNode: BaseBuilderMatNodeType | Material, renderer: WebGLRenderer) {
		let material: Material;
		if (matNode instanceof Material) {
			material = matNode;
		} else {
			material = matNode.material;
			await matNode.compute();
		}
		this._mesh.material = material;
		renderer.compile(this._mesh, this._camera);
	}
	private static _createMatCompileScene(): Scene {
		this._scene = new Scene();
		this._mesh = new Mesh(new BoxBufferGeometry(1, 1, 1));
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
