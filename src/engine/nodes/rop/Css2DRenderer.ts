import {TypedRopNode} from './_Base';
import {CSS2DRenderer} from '../../../../modules/three/examples/jsm/renderers/CSS2DRenderer';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class WebGlRendererRopParamsConfig extends NodeParamsConfig {
	css = ParamConfig.STRING('', {
		multiline: true,
	});
}
const ParamsConfig = new WebGlRendererRopParamsConfig();

export class Css2DRendererRopNode extends TypedRopNode<WebGlRendererRopParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'css2d_renderer'> {
		return 'css2d_renderer';
	}

	private _renderers_by_canvas_id: Dictionary<CSS2DRenderer> = {};
	create_renderer(canvas: HTMLCanvasElement) {
		const renderer = new CSS2DRenderer();
		this._renderers_by_canvas_id[canvas.id] = renderer;
		const parent = canvas.parentElement;
		if (parent) {
			parent.appendChild(renderer.domElement);
			parent.style.position = 'relative';
		}
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0px';
		renderer.domElement.style.left = '0px';
		renderer.domElement.style.pointerEvents = 'none';
		renderer.setSize(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
		return renderer;
	}
	renderer(canvas: HTMLCanvasElement) {
		return this._renderers_by_canvas_id[canvas.id] || this.create_renderer(canvas);
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

	cook() {
		this.cook_controller.end_cook();
	}
}
