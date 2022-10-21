/**
 * Creates a CSS3DRenderer
 *
 * @param
 * If you want to display HTML elements that follow the 3D objects, you will need to create this node, and set the camera css renderer to it. If you can CSSObjects in your scene, they will then be displayed.
 *
 * Note that the CSS3DRenderer currently requires the WebGLRenderer to have a pixelRatio of 1. Since the default is 2 for desktop, you would need to assign your own WebGLRenderer node to the camera and set its pixelRatio to 1.
 *
 */
import {DEFAULT_CSS3DOBJECT_CLASS} from './../../operations/sop/CSS3DObject';
import {TypedRopNode} from './_Base';
import {CSS3DRenderer} from '../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import {RopType} from '../../poly/registers/nodes/types/Rop';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {StringParamLanguage} from '../../params/utils/OptionsController';

const DEFAULT_CSS = `.${DEFAULT_CSS3DOBJECT_CLASS} {
	will-change: transform;
}`;

class CSS3DRendererRopParamsConfig extends NodeParamsConfig {
	/** @param css rules to be added in the html document */
	css = ParamConfig.STRING(DEFAULT_CSS, {
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
		renderer.domElement.style.willChange = 'transform';

		this._updateRenderer(renderer);
		return renderer;
	}
	mountRenderer(canvas: HTMLCanvasElement) {
		const renderer = this._renderersByCanvasId.get(canvas.id);
		if (!renderer) {
			console.warn(`no render found for canvas ${canvas.id}. cannot mount CSS2DRenderer`);
			return;
		}
		const parent = canvas.parentElement;
		if (parent) {
			parent.prepend(renderer.domElement);
			parent.style.position = 'relative';
		} else {
			console.warn('canvas has no parent');
		}
		const rect = canvas.getBoundingClientRect();
		renderer.setSize(rect.width, rect.height);
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
		this._updateCSS();

		this._renderersByCanvasId.forEach((renderer) => {
			this._updateRenderer(renderer);
		});

		this.cookController.endCook();
	}

	private _updateRenderer(renderer: CSS3DRenderer) {
		// renderer.set_sorting(this.pv.sortObjects);
		// renderer.set_use_fog(this.pv.useFog);
		// renderer.set_fog_range(this.pv.fogNear, this.pv.fogFar);
	}

	private _updateCSS() {
		const element = this._CSSElement();
		// console.log(element);
		// if (element.rules.length > 0) {
		// 	element.deleteRule(0);
		// }
		// element.insertRule(this.pv.css);
		// console.log('rule inserted', this.pv.css);
		element.innerHTML = this.pv.css;
	}

	private __CSSElement: HTMLElement | undefined; // = new CSSStyleSheet();
	private _CSSElement() {
		return (this.__CSSElement = this.__CSSElement || this._findElement() || this._createElement());
	}
	private _findElement() {
		return document.getElementById(this._CSSElementId());
	}
	private _createElement() {
		const style = document.createElement('style');
		// document.body.append(element);
		// https://davidwalsh.name/add-rules-stylesheets
		// WebKit hack :(
		style.appendChild(document.createTextNode(''));
		document.head.appendChild(style);

		style.id = this._CSSElementId();
		return style;
	}
	private _CSSElementId() {
		return `CSS2DRenderer-${this.graphNodeId()}`;
	}
}
