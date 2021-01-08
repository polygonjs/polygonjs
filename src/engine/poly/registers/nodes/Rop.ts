import {CATEGORY_ROP} from './Category';

import {AnimationsRopNode} from '../../../nodes/rop/Animations';
import {CopRopNode} from '../../../nodes/rop/Cop';
import {Css2DRendererRopNode} from '../../../nodes/rop/Css2DRenderer';
import {Css3DRendererRopNode} from '../../../nodes/rop/Css3DRenderer';
import {EventsRopNode} from '../../../nodes/rop/Events';
import {MaterialsRopNode} from '../../../nodes/rop/Materials';
import {PostProcessRopNode} from '../../../nodes/rop/PostProcess';
import {RenderersRopNode} from '../../../nodes/rop/Renderers';
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
	// networks
	animations: AnimationsRopNode;
	cop: CopRopNode;
	events: EventsRopNode;
	materials: MaterialsRopNode;
	postProcess: PostProcessRopNode;
	renderers: RenderersRopNode;
}

import {Poly} from '../../../Poly';
export class RopRegister {
	static run(poly: Poly) {
		poly.registerNode(Css2DRendererRopNode, CATEGORY_ROP.CSS);
		// poly.registerNode(Css3DRendererRopNode, CATEGORY_ROP.CSS); // not registering, since sop/css3d_object is not yet working
		poly.registerNode(WebGlRendererRopNode, CATEGORY_ROP.WEBGL);
		// networks
		poly.registerNode(AnimationsRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(CopRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(EventsRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(MaterialsRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(PostProcessRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(RenderersRopNode, CATEGORY_ROP.NETWORK);
	}
}
