import {Vector2} from 'three/src/math/Vector2';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {PerspectiveCameraObjNode} from '../../src/engine/nodes/obj/PerspectiveCamera';
import {Poly} from '../../src/engine/Poly';
import {ThreejsViewer} from '../../src/engine/viewers/Threejs';

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
			const viewer = window.perspective_camera1.renderController().createRenderer(canvas, size);
			const renderer = await Poly.renderersController.waitForRenderer();
			const config = {canvas, viewer, renderer};
			this._configs.push(config);
			resolve(config);
		});
	}

	static dispose() {
		let config: RendererConfig | undefined;
		while ((config = this._configs.pop())) {
			config.viewer?.dispose();
			config.canvas.parentElement?.removeChild(config.canvas);
		}
	}
}
