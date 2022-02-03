import {Vector2} from 'three/src/math/Vector2';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';
import {Mesh} from 'three/src/objects/Mesh';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {BaseBuilderMatNodeType} from '../../src/engine/nodes/mat/_BaseBuilder';
import {PerspectiveCameraObjNode} from '../../src/engine/nodes/obj/PerspectiveCamera';
import {Poly} from '../../src/engine/Poly';
import {ThreejsViewer} from '../../src/engine/viewers/Threejs';
import {BoxBufferGeometry} from 'three/src/geometries/BoxGeometry';

interface RendererConfig {
	canvas: HTMLCanvasElement;
	renderer: WebGLRenderer;
	viewer?: WebGLRenderer;
}

interface WithViewerCallbackArgs {
	viewer: ThreejsViewer;
	element: HTMLElement;
}
interface WithViewerOptions {
	cameraNode: PerspectiveCameraObjNode;
}
type WithViewerCallback = (args: WithViewerCallbackArgs) => Promise<void>;
export class RendererUtils {
	private static _configs: RendererConfig[] = [];

	static async withViewer(options: WithViewerOptions, callback: WithViewerCallback) {
		const element = document.createElement('div');
		// element.style.position = 'absolute';
		// element.style.top = '0px';
		// element.style.left = '0px';
		// element.style.width = '200px';
		// element.style.height = '200px';
		// element.style.zIndex = '9999999';
		document.body.appendChild(element);
		const viewer = options.cameraNode.createViewer({element});
		// options.cameraNode.scene().viewersRegister.viewerWithCamera(options.cameraNode)
		await callback({viewer, element});

		viewer.dispose();
		document.body.removeChild(element);
	}

	static async waitForRenderer(): Promise<RendererConfig> {
		return new Promise(async (resolve) => {
			const canvas = document.createElement('canvas');
			document.body.appendChild(canvas);
			const size = new Vector2(canvas.width, canvas.height);
			const viewer = await window.perspective_camera1.renderController().createRenderer(canvas, size);
			const renderer = await Poly.renderersController.waitForRenderer();
			const config = {canvas, viewer, renderer};
			this._configs.push(config);
			resolve(config);
		});
	}

	private static _scene = this._createMatCompileScene();
	private static _camera = new PerspectiveCamera();
	private static _mesh = new Mesh();
	static async compile(matNode: BaseBuilderMatNodeType, renderer: WebGLRenderer) {
		await matNode.compute();
		this._mesh.material = matNode.material;
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
