import {CATEGORY_ROP} from './Category';

import {Css2DRendererRopNode} from '../../../nodes/rop/Css2DRenderer';
import {Css3DRendererRopNode} from '../../../nodes/rop/Css3DRenderer';
import {WebGlRendererRopNode} from '../../../nodes/rop/WebglRenderer';

export enum RopType {
	CSS2D = 'css2d_renderer',
	CSS3D = 'css3d_renderer',
	WEBGL = 'webgl_renderer',
}

export interface RopNodeChildrenMap {
	css2d_renderer: Css2DRendererRopNode;
	css3d_renderer: Css3DRendererRopNode;
	webgl_renderer: WebGlRendererRopNode;
}

import {Poly} from '../../../Poly';
export class RopRegister {
	static run(poly: Poly) {
		poly.register_node(Css2DRendererRopNode, CATEGORY_ROP.CSS);
		// poly.register_node(Css3DRendererRopNode, CATEGORY_ROP.CSS); // not registering, since sop/css3d_object is not yet working
		poly.register_node(WebGlRendererRopNode, CATEGORY_ROP.WEBGL);
	}
}
