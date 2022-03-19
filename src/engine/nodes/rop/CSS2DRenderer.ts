/**
 * Creates a CSS2DRenderer
 *
 * @param
 * If you want to display HTML elements that follow the 3D objects, you will need to create this node, and set the camera css renderer to it. If you can CSSObjects in your scene, they will then be displayed.
 *
 * Note that the CSS2DRenderer currently requires the WebGLRenderer to have a pixelRatio of 1. Since the default is 2 for desktop, you would need to assign your own WebGLRenderer node to the camera and set its pixelRatio to 1.
 *
 */
import {TypedRopNode} from './_Base';
import {CSS2DRenderer} from '../../../modules/core/renderers/CSS2DRenderer';
import {RopType} from '../../poly/registers/nodes/types/Rop';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {StringParamLanguage} from '../../params/utils/OptionsController';
class CSS2DRendererRopParamsConfig extends NodeParamsConfig {
	/** @param css rules to be added in the html document */
	css = ParamConfig.STRING('', {
		language: StringParamLanguage.CSS,
	});
	/** @param toggle on to ensure objects z-index is set based on camera depth */
	sortObjects = ParamConfig.BOOLEAN(0);
	/** @param toggle on to have css opacity be set from camera depth */
	useFog = ParamConfig.BOOLEAN(0);
	/** @param fog near */
	fogNear = ParamConfig.FLOAT(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {useFog: 1},
	});
	/** @param fog far */
	fogFar = ParamConfig.FLOAT(100, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {useFog: 1},
	});
}
const ParamsConfig = new CSS2DRendererRopParamsConfig();

export class CSS2DRendererRopNode extends TypedRopNode<CSS2DRendererRopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<RopType.CSS2D> {
		return RopType.CSS2D;
	}

	private _renderers_by_canvas_id: Map<string, CSS2DRenderer> = new Map();
	createRenderer(canvas: HTMLCanvasElement) {
		const renderer = new CSS2DRenderer();
		this._renderers_by_canvas_id.set(canvas.id, renderer);
		const parent = canvas.parentElement;
		if (parent) {
			parent.prepend(renderer.domElement);
			parent.style.position = 'relative';
		}
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0px';
		renderer.domElement.style.left = '0px';
		renderer.domElement.style.pointerEvents = 'none';

		const rect = canvas.getBoundingClientRect();

		renderer.setSize(rect.width, rect.height);
		this._update_renderer(renderer);
		return renderer;
	}
	renderer(canvas: HTMLCanvasElement) {
		return this._renderers_by_canvas_id.get(canvas.id) || this.createRenderer(canvas);
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
		this._update_css();

		this._renderers_by_canvas_id.forEach((renderer) => {
			this._update_renderer(renderer);
		});

		this.cookController.endCook();
	}

	private _update_renderer(renderer: CSS2DRenderer) {
		renderer.set_sorting(this.pv.sortObjects);
		renderer.set_use_fog(this.pv.useFog);
		renderer.set_fog_range(this.pv.fogNear, this.pv.fogFar);
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
		return `css_2d_renderer-${this.graphNodeId()}`;
	}
}
