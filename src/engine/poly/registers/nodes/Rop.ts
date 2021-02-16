import {CATEGORY_ROP} from './Category';

import {AnimationsRopNode} from '../../../nodes/rop/Animations';
import {CopRopNode} from '../../../nodes/rop/Cop';
import {Css2DRendererRopNode} from '../../../nodes/rop/CSS2DRenderer';
import {Css3DRendererRopNode} from '../../../nodes/rop/CSS3DRenderer';
import {EventsRopNode} from '../../../nodes/rop/Events';
import {MaterialsRopNode} from '../../../nodes/rop/Materials';
import {PostProcessRopNode} from '../../../nodes/rop/PostProcess';
import {RenderersRopNode} from '../../../nodes/rop/Renderers';
import {WebGlRendererRopNode} from '../../../nodes/rop/WebGLRenderer';

export enum RopType {
	CSS2D = 'CSS2DRenderer',
	CSS3D = 'CSS3DRenderer',
	WEBGL = 'WebGLRenderer',
}

export interface RopNodeChildrenMap {
	CSS2DRenderer: Css2DRendererRopNode;
	CSS3DRenderer: Css3DRendererRopNode;
	WebGLRenderer: WebGlRendererRopNode;
	// networks
	animations: AnimationsRopNode;
	cop: CopRopNode;
	events: EventsRopNode;
	materials: MaterialsRopNode;
	postProcess: PostProcessRopNode;
	renderers: RenderersRopNode;
}

import {PolyEngine} from '../../../Poly';
export class RopRegister {
	static run(poly: PolyEngine) {
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
