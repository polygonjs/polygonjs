import {CATEGORY_ROP} from './Category';

import {CSS2DRendererRopNode} from '../../../nodes/rop/CSS2DRenderer';
import {CSS3DRendererRopNode} from '../../../nodes/rop/CSS3DRenderer';
import {PathTracingRendererRopNode} from '../../../nodes/rop/PathTracingRenderer';
import {WebGLRendererRopNode} from '../../../nodes/rop/WebGLRenderer';
// networks
import {ActorsNetworkRopNode} from '../../../nodes/rop/ActorsNetwork';
import {AnimationsNetworkRopNode} from '../../../nodes/rop/AnimationsNetwork';
import {AudioNetworkRopNode} from '../../../nodes/rop/AudioNetwork';
import {CopNetworkRopNode} from '../../../nodes/rop/CopNetwork';
import {EventsNetworkRopNode} from '../../../nodes/rop/EventsNetwork';
import {MaterialsNetworkRopNode} from '../../../nodes/rop/MaterialsNetwork';
import {PostProcessNetworkRopNode} from '../../../nodes/rop/PostProcessNetwork';
import {RenderersNetworkRopNode} from '../../../nodes/rop/RenderersNetwork';

export interface RopNodeChildrenMap {
	CSS2DRenderer: CSS2DRendererRopNode;
	CSS3DRenderer: CSS3DRendererRopNode;
	pathTracingRenderer: PathTracingRendererRopNode;
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
		poly.registerNode(CSS3DRendererRopNode, CATEGORY_ROP.CSS);
		// if (process.env.NODE_ENV == 'development') {
		poly.registerNode(PathTracingRendererRopNode, CATEGORY_ROP.WEBGL);
		// }
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
