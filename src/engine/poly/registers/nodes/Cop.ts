import {CATEGORY_COP} from './Category';

import {BuilderCopNode} from '../../../nodes/cop/Builder';
import {CanvasCopNode} from '../../../nodes/cop/Canvas';
import {ColorCopNode} from '../../../nodes/cop/Color';
import {CubeCameraCopNode} from '../../../nodes/cop/CubeCamera';
import {EnvMapCopNode} from '../../../nodes/cop/EnvMap';
import {GifCopNode} from '../../../nodes/cop/Gif';
import {ImageCopNode} from '../../../nodes/cop/Image';
import {LightMapCopNode} from '../../../nodes/cop/LightMap';
import {NullCopNode} from '../../../nodes/cop/Null';
// import {PostCopNode} from '../../../nodes/cop/Post';
import {PaletteCopNode} from '../../../nodes/cop/Palette';
import {RenderCopNode} from '../../../nodes/cop/Render';
import {SnapshotCopNode} from '../../../nodes/cop/Snapshot';
import {SwitchCopNode} from '../../../nodes/cop/Switch';
import {TexturePropertiesCopNode} from '../../../nodes/cop/TextureProperties';
import {VideoCopNode} from '../../../nodes/cop/Video';
import {WebCamCopNode} from '../../../nodes/cop/WebCam';
// networks
import {AnimationsNetworkCopNode} from '../../../nodes/cop/AnimationsNetwork';
import {AudioNetworkCopNode} from '../../../nodes/cop/AudioNetwork';
import {EventsNetworkCopNode} from '../../../nodes/cop/EventsNetwork';
import {CopNetworkCopNode} from '../../../nodes/cop/CopNetwork';
import {MaterialsNetworkCopNode} from '../../../nodes/cop/MaterialsNetwork';
import {PostProcessNetworkCopNode} from '../../../nodes/cop/PostProcessNetwork';
import {RenderersNetworkCopNode} from '../../../nodes/cop/RenderersNetwork';

export interface CopNodeChildrenMap {
	builder: BuilderCopNode;
	canvas: CanvasCopNode;
	color: ColorCopNode;
	cubeCamera: CubeCameraCopNode;
	envMap: EnvMapCopNode;
	gif: GifCopNode;
	image: ImageCopNode;
	lightMap: LightMapCopNode;
	null: NullCopNode;
	// post: PostCopNode;
	palette: PaletteCopNode;
	render: RenderCopNode;
	snapshot: SnapshotCopNode;
	switch: SwitchCopNode;
	textureProperties: TexturePropertiesCopNode;
	video: VideoCopNode;
	webCam: WebCamCopNode;
	// networks
	animationsNetwork: AnimationsNetworkCopNode;
	audioNetwork: AudioNetworkCopNode;
	copNetwork: CopNetworkCopNode;
	eventsNetwork: EventsNetworkCopNode;
	materialsNetwork: MaterialsNetworkCopNode;
	postProcessNetwork: PostProcessNetworkCopNode;
	renderersNetwork: RenderersNetworkCopNode;
}

import {PolyEngine} from '../../../Poly';
export class CopRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(BuilderCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(CanvasCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ColorCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(CubeCameraCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(GifCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(LightMapCopNode, CATEGORY_COP.MISC);
		poly.registerNode(NullCopNode, CATEGORY_COP.MISC);
		// poly.registerNode(PostCopNode, CATEGORY_COP.FILTER); // removed until usable
		poly.registerNode(PaletteCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(RenderCopNode, CATEGORY_COP.MISC);
		poly.registerNode(SnapshotCopNode, CATEGORY_COP.MISC);
		poly.registerNode(SwitchCopNode, CATEGORY_COP.MISC);
		poly.registerNode(TexturePropertiesCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(VideoCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(WebCamCopNode, CATEGORY_COP.ADVANCED);
		// networks
		poly.registerNode(AnimationsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(AudioNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(CopNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(EventsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(MaterialsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(PostProcessNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(RenderersNetworkCopNode, CATEGORY_COP.NETWORK);
	}
}
