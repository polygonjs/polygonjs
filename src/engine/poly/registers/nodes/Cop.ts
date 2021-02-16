import {CATEGORY_COP} from './Category';

import {AnimationsCopNode} from '../../../nodes/cop/Animations';
import {BuilderCopNode} from '../../../nodes/cop/Builder';
import {ColorCopNode} from '../../../nodes/cop/Color';
import {CopCopNode} from '../../../nodes/cop/Cop';
import {EnvMapCopNode} from '../../../nodes/cop/EnvMap';
import {EventsCopNode} from '../../../nodes/cop/Events';
import {ImageCopNode} from '../../../nodes/cop/Image';
import {MaterialsCopNode} from '../../../nodes/cop/Materials';
import {NullCopNode} from '../../../nodes/cop/Null';
import {PostCopNode} from '../../../nodes/cop/Post';
import {PostProcessCopNode} from '../../../nodes/cop/PostProcess';
import {RenderersCopNode} from '../../../nodes/cop/Renderers';
import {SwitchCopNode} from '../../../nodes/cop/Switch';
import {TexturePropertiesCopNode} from '../../../nodes/cop/TextureProperties';
import {VideoCopNode} from '../../../nodes/cop/Video';
import {WebCamCopNode} from '../../../nodes/cop/WebCam';

export interface CopNodeChildrenMap {
	builder: BuilderCopNode;
	color: ColorCopNode;
	envMap: EnvMapCopNode;
	image: ImageCopNode;
	post: PostCopNode;
	null: NullCopNode;
	switch: SwitchCopNode;
	textureProperties: TexturePropertiesCopNode;
	video: VideoCopNode;
	webCam: WebCamCopNode;
	// networks
	animations: AnimationsCopNode;
	cop: CopCopNode;
	events: EventsCopNode;
	materials: MaterialsCopNode;
	postProcess: PostProcessCopNode;
	renderers: RenderersCopNode;
}

import {PolyEngine} from '../../../Poly';
export class CopRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(BuilderCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(ColorCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(NullCopNode, CATEGORY_COP.MISC);
		poly.registerNode(PostCopNode, CATEGORY_COP.FILTER);
		poly.registerNode(SwitchCopNode, CATEGORY_COP.MISC);
		poly.registerNode(TexturePropertiesCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(VideoCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(WebCamCopNode, CATEGORY_COP.ADVANCED);
		// networks
		poly.registerNode(AnimationsCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(CopCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(EventsCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(MaterialsCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(RenderersCopNode, CATEGORY_COP.NETWORK);
	}
}
