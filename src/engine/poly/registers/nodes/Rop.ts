import {CATEGORY_ROP} from './Category';

import {Css2DRendererRopNode} from '../../../nodes/rop/Css2DRenderer';
import {WebGlRendererRopNode} from '../../../nodes/rop/WebGLRenderer';

export interface RopNodeChildrenMap {
	css2d_renderer: Css2DRendererRopNode;
	webgl_renderer: WebGlRendererRopNode;
}

import {Poly} from '../../../Poly';
export class RopRegister {
	static run(poly: Poly) {
		poly.register_node(Css2DRendererRopNode, CATEGORY_ROP.RENDERER);
		poly.register_node(WebGlRendererRopNode, CATEGORY_ROP.RENDERER);
	}
}
