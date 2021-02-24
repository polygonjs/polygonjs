import {TypedRopNode} from './_Base';
import {CSS3DRenderer} from '../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import {RopType} from '../../poly/registers/nodes/types/Rop';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PolyDictionary} from '../../../types/GlobalTypes';
class Css3DRendererRopParamsConfig extends NodeParamsConfig {
	/** @param css rules to be added in the html document */
	css = ParamConfig.STRING('', {
		multiline: true,
	});
}
const ParamsConfig = new Css3DRendererRopParamsConfig();

export class Css3DRendererRopNode extends TypedRopNode<Css3DRendererRopParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<RopType.CSS3D> {
		return RopType.CSS3D;
	}

	private _renderers_by_canvas_id: PolyDictionary<CSS3DRenderer> = {};
	create_renderer(canvas: HTMLCanvasElement) {
		const renderer = new CSS3DRenderer();
		this._renderers_by_canvas_id[canvas.id] = renderer;
		const parent = canvas.parentElement;
		if (parent) {
			parent.prepend(renderer.domElement);
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
		this.cookController.endCook();
	}
}
