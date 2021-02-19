import {CATEGORY_ROP} from './Category';

import {AnimationsRopNode} from '../../../nodes/rop/Animations';
import {CopRopNode} from '../../../nodes/rop/Cop';
import {CSS2DRendererRopNode} from '../../../nodes/rop/CSS2DRenderer';
import {Css3DRendererRopNode} from '../../../nodes/rop/CSS3DRenderer';
import {EventsRopNode} from '../../../nodes/rop/Events';
import {MaterialsRopNode} from '../../../nodes/rop/Materials';
import {PostProcessRopNode} from '../../../nodes/rop/PostProcess';
import {RenderersRopNode} from '../../../nodes/rop/Renderers';
import {WebGLRendererRopNode} from '../../../nodes/rop/WebGLRenderer';

export enum RopType {
	CSS2D = 'CSS2DRenderer',
	CSS3D = 'CSS3DRenderer',
	WEBGL = 'WebGLRenderer',
}

export interface RopNodeChildrenMap {
	CSS2DRenderer: CSS2DRendererRopNode;
	CSS3DRenderer: Css3DRendererRopNode;
	WebGLRenderer: WebGLRendererRopNode;
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
		poly.registerNode(CSS2DRendererRopNode, CATEGORY_ROP.CSS);
		// poly.registerNode(Css3DRendererRopNode, CATEGORY_ROP.CSS); // not registering, since sop/css3d_object is not yet working
		poly.registerNode(WebGLRendererRopNode, CATEGORY_ROP.WEBGL);
		// networks
		poly.registerNode(AnimationsRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(CopRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(EventsRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(MaterialsRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(PostProcessRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(RenderersRopNode, CATEGORY_ROP.NETWORK);
	}
}
