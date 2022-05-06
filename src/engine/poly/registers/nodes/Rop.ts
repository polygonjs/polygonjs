import {CATEGORY_ROP} from './Category';

import {CopNetworkRopNode} from '../../../nodes/rop/CopNetwork';
import {CSS2DRendererRopNode} from '../../../nodes/rop/CSS2DRenderer';
// import {CSS3DRendererRopNode} from '../../../nodes/rop/CSS3DRenderer';
// networks
import {ActorsNetworkRopNode} from '../../../nodes/rop/ActorsNetwork';
import {AnimationsNetworkRopNode} from '../../../nodes/rop/AnimationsNetwork';
import {AudioNetworkRopNode} from '../../../nodes/rop/AudioNetwork';
import {EventsNetworkRopNode} from '../../../nodes/rop/EventsNetwork';
import {MaterialsNetworkRopNode} from '../../../nodes/rop/MaterialsNetwork';
import {PostProcessNetworkRopNode} from '../../../nodes/rop/PostProcessNetwork';
import {RenderersNetworkRopNode} from '../../../nodes/rop/RenderersNetwork';
import {WebGLRendererRopNode} from '../../../nodes/rop/WebGLRenderer';

export interface RopNodeChildrenMap {
	CSS2DRenderer: CSS2DRendererRopNode;
	// CSS3DRenderer: CSS3DRendererRopNode;
	WebGLRenderer: WebGLRendererRopNode;
	// networks
	actorsNetwork: ActorsNetworkRopNode;
	animationsNetwork: AnimationsNetworkRopNode;
	audioNetwork: AudioNetworkRopNode;
	copNetwork: CopNetworkRopNode;
	eventsNetwork: EventsNetworkRopNode;
	materialsNetwork: MaterialsNetworkRopNode;
	postProcessNetwork: PostProcessNetworkRopNode;
	renderersNetwork: RenderersNetworkRopNode;
}

import {PolyEngine} from '../../../Poly';
export class RopRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CSS2DRendererRopNode, CATEGORY_ROP.CSS);
		// poly.registerNode(Css3DRendererRopNode, CATEGORY_ROP.CSS); // not registering, since sop/css3d_object is not yet working
		poly.registerNode(WebGLRendererRopNode, CATEGORY_ROP.WEBGL);
		// networks
		poly.registerNode(ActorsNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(AnimationsNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(AudioNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(CopNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(EventsNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(MaterialsNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(PostProcessNetworkRopNode, CATEGORY_ROP.NETWORK);
		poly.registerNode(RenderersNetworkRopNode, CATEGORY_ROP.NETWORK);
	}
}
