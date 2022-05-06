import {TypedRopNode} from './_Base';
import {CSS3DRenderer} from '../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import {RopType} from '../../poly/registers/nodes/types/Rop';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {StringParamLanguage} from '../../params/utils/OptionsController';
class CSS3DRendererRopParamsConfig extends NodeParamsConfig {
	/** @param css rules to be added in the html document */
	css = ParamConfig.STRING('', {
		language: StringParamLanguage.CSS,
	});
}
const ParamsConfig = new CSS3DRendererRopParamsConfig();

export class CSS3DRendererRopNode extends TypedRopNode<CSS3DRendererRopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<RopType.CSS3D> {
		return RopType.CSS3D;
	}
	private _renderersByCanvasId: Map<string, CSS3DRenderer> = new Map();
	createRenderer(canvas: HTMLCanvasElement) {
		const renderer = new CSS3DRenderer();
		this._renderersByCanvasId.set(canvas.id, renderer);

		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0px';
		renderer.domElement.style.left = '0px';
		renderer.domElement.style.pointerEvents = 'none';

		return renderer;
	}
	mountRenderer(canvas: HTMLCanvasElement) {
		const renderer = this._renderersByCanvasId.get(canvas.id);
		if (!renderer) {
			return;
		}
		const parent = canvas.parentElement;
		if (parent) {
			parent.prepend(renderer.domElement);
			parent.style.position = 'relative';
		} else {
			console.warn('canvas has no parent');
		}
		renderer.setSize(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
	}
	unmountRenderer(canvas: HTMLCanvasElement) {
		const renderer = this._renderersByCanvasId.get(canvas.id);
		if (!renderer) {
			return;
		}
		renderer.domElement.parentElement?.removeChild(renderer.domElement);
	}
	renderer(canvas: HTMLCanvasElement) {
		return this._renderersByCanvasId.get(canvas.id) || this.createRenderer(canvas);
	}
	// remove_renderer_element(canvas: HTMLCanvasElement) {
	// 	// not ideal, because I could not re-add it back
	// 	const renderer = this.renderer(canvas);
	// 	if (renderer) {
	// 		const parent = canvas.parentElement;
	// 		if (parent) {
	// 			parent.removeChild(renderer.domElement);
	// 		}
	// 	}
	// }

	override cook() {
		this.cookController.endCook();
	}
}
