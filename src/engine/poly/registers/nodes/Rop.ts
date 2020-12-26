import {CATEGORY_ROP} from './Category';

import {Css2DRendererRopNode} from '../../../nodes/rop/Css2DRenderer';
import {Css3DRendererRopNode} from '../../../nodes/rop/Css3DRenderer';
import {WebGlRendererRopNode} from '../../../nodes/rop/WebglRenderer';

export enum RopType {
	CSS2D = 'css2DRenderer',
	CSS3D = 'css3DRenderer',
	WEBGL = 'webGlRenderer',
}

export interface RopNodeChildrenMap {
	css2DRenderer: Css2DRendererRopNode;
	css3DRenderer: Css3DRendererRopNode;
	webGlRenderer: WebGlRendererRopNode;
}

import {Poly} from '../../../Poly';
export class RopRegister {
	static run(poly: Poly) {
		poly.registerNode(Css2DRendererRopNode, CATEGORY_ROP.CSS);
		// poly.registerNode(Css3DRendererRopNode, CATEGORY_ROP.CSS); // not registering, since sop/css3d_object is not yet working
		poly.registerNode(WebGlRendererRopNode, CATEGORY_ROP.WEBGL);
	}
}
