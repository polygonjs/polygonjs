import {TypedRopNode} from './_Base';
import {CSS2DRenderer} from '../../../../modules/three/examples/jsm/renderers/CSS2DRenderer';
import {RopType} from '../../poly/registers/nodes/Rop';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class Css2DRendererRopParamsConfig extends NodeParamsConfig {
	css = ParamConfig.STRING('', {
		multiline: true,
	});
}
const ParamsConfig = new Css2DRendererRopParamsConfig();

export class Css2DRendererRopNode extends TypedRopNode<Css2DRendererRopParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<RopType.CSS2D> {
		return RopType.CSS2D;
	}

	private _renderers_by_canvas_id: Dictionary<CSS2DRenderer> = {};
	create_renderer(canvas: HTMLCanvasElement) {
		const renderer = new CSS2DRenderer();
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
		this._update_css();
		this.cook_controller.end_cook();
	}

	private _update_css() {
		const element = this.css_element();
		// console.log(element);
		// if (element.rules.length > 0) {
		// 	element.deleteRule(0);
		// }
		// element.insertRule(this.pv.css);
		// console.log('rule inserted', this.pv.css);
		element.innerHTML = this.pv.css;
	}

	private _css_element: HTMLElement | undefined; // = new CSSStyleSheet();
	private css_element() {
		return (this._css_element = this._css_element || this._find_element() || this._create_element());
	}
	private _find_element() {
		return document.getElementById(this._css_element_id());
	}
	private _create_element() {
		const style = document.createElement('style');
		// document.body.append(element);
		// https://davidwalsh.name/add-rules-stylesheets
		// WebKit hack :(
		style.appendChild(document.createTextNode(''));
		document.head.appendChild(style);

		style.id = this._css_element_id();
		return style;
	}
	private _css_element_id() {
		return `css_2d_renderer-${this.graph_node_id}`;
	}
}
