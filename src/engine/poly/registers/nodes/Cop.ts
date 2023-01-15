import {CATEGORY_COP} from './Category';

import {AudioAnalyserCopNode} from '../../../nodes/cop/AudioAnalyser';
import {BuilderCopNode} from '../../../nodes/cop/Builder';
import {Builder2DArrayCopNode} from '../../../nodes/cop/Builder2DArray';
import {CanvasCopNode} from '../../../nodes/cop/Canvas';
import {ColorCopNode} from '../../../nodes/cop/Color';
import {CubeMapCopNode} from '../../../nodes/cop/CubeMap';
import {CubeCameraCopNode} from '../../../nodes/cop/CubeCamera';
import {CubeMapFromSceneCopNode} from '../../../nodes/cop/CubeMapFromScene';
import {EnvMapCopNode} from '../../../nodes/cop/EnvMap';
import {GifCopNode} from '../../../nodes/cop/Gif';
import {ImageCopNode} from '../../../nodes/cop/Image';
import {ImageEXRCopNode} from '../../../nodes/cop/ImageEXR';
import {ImageHDRCopNode} from '../../../nodes/cop/ImageHDR';
import {ImageKTX2CopNode} from '../../../nodes/cop/ImageKTX2';
// import {ImageSequenceCopNode} from '../../../nodes/cop/ImageSequence';
import {LightMapCopNode} from '../../../nodes/cop/LightMap';
import {LutCopNode} from '../../../nodes/cop/Lut';
import {NullCopNode} from '../../../nodes/cop/Null';
// import {PostCopNode} from '../../../nodes/cop/Post';
import {PaletteCopNode} from '../../../nodes/cop/Palette';
import {FetchCopNode} from '../../../nodes/cop/Fetch';
import {RenderCopNode} from '../../../nodes/cop/Render';
import {SDFBlurCopNode} from '../../../nodes/cop/SDFBlur';
import {SDFExporterCopNode} from '../../../nodes/cop/SDFExporter';
import {SDFFromObjectCopNode} from '../../../nodes/cop/SDFFromObject';
import {SDFFromUrlCopNode} from '../../../nodes/cop/SDFFromUrl';
import {SnapshotCopNode} from '../../../nodes/cop/Snapshot';
import {SwitchCopNode} from '../../../nodes/cop/Switch';
import {TexturePropertiesCopNode} from '../../../nodes/cop/TextureProperties';
import {VideoCopNode} from '../../../nodes/cop/Video';
import {WebCamCopNode} from '../../../nodes/cop/WebCam';
import {WebXRARCopNode} from '../../../nodes/cop/WebXRAR';
// networks
import {ActorsNetworkCopNode} from '../../../nodes/cop/ActorsNetwork';
import {AnimationsNetworkCopNode} from '../../../nodes/cop/AnimationsNetwork';
import {AudioNetworkCopNode} from '../../../nodes/cop/AudioNetwork';
import {EventsNetworkCopNode} from '../../../nodes/cop/EventsNetwork';
import {CopNetworkCopNode} from '../../../nodes/cop/CopNetwork';
import {MaterialsNetworkCopNode} from '../../../nodes/cop/MaterialsNetwork';
import {PostProcessNetworkCopNode} from '../../../nodes/cop/PostProcessNetwork';
import {RenderersNetworkCopNode} from '../../../nodes/cop/RenderersNetwork';

export interface CopNodeChildrenMap {
	audioAnalyser: AudioAnalyserCopNode;
	builder: BuilderCopNode;
	builder2DArray: Builder2DArrayCopNode;
	canvas: CanvasCopNode;
	color: ColorCopNode;
	cubeMap: CubeMapCopNode;
	cubeCamera: CubeCameraCopNode;
	cubeMapFromScene: CubeMapFromSceneCopNode;
	envMap: EnvMapCopNode;
	gif: GifCopNode;
	image: ImageCopNode;
	imageEXR: ImageEXRCopNode;
	imageHDR: ImageHDRCopNode;
	imageKTX2: ImageKTX2CopNode;
	// imageSequence: ImageSequenceCopNode;
	lightMap: LightMapCopNode;
	lut: LutCopNode;
	null: NullCopNode;
	// post: PostCopNode;
	palette: PaletteCopNode;
	fetch: FetchCopNode;
	render: RenderCopNode;
	SDFBlur: SDFBlurCopNode;
	SDFExporter: SDFExporterCopNode;
	SDFFromObject: SDFFromObjectCopNode;
	SDFFromUrl: SDFFromUrlCopNode;
	snapshot: SnapshotCopNode;
	switch: SwitchCopNode;
	textureProperties: TexturePropertiesCopNode;
	video: VideoCopNode;
	webCam: WebCamCopNode;
	webXRAR: WebXRARCopNode;
	// networks
	actorsNetwork: ActorsNetworkCopNode;
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
		poly.registerNode(AudioAnalyserCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(BuilderCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(Builder2DArrayCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(CanvasCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ColorCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(CubeMapCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(CubeCameraCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(CubeMapFromSceneCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(GifCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageEXRCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageHDRCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageKTX2CopNode, CATEGORY_COP.INPUT);
		// poly.registerNode(ImageSequenceCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(LightMapCopNode, CATEGORY_COP.MISC);
		poly.registerNode(LutCopNode, CATEGORY_COP.MISC);
		poly.registerNode(NullCopNode, CATEGORY_COP.MISC);
		// poly.registerNode(PostCopNode, CATEGORY_COP.FILTER); // removed until usable
		poly.registerNode(PaletteCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(FetchCopNode, CATEGORY_COP.MISC);
		poly.registerNode(RenderCopNode, CATEGORY_COP.MISC);
		if (process.env.NODE_ENV == 'development') {
			poly.registerNode(SDFBlurCopNode, CATEGORY_COP.SDF);
		}
		poly.registerNode(SDFExporterCopNode, CATEGORY_COP.SDF);
		poly.registerNode(SDFFromObjectCopNode, CATEGORY_COP.SDF);
		poly.registerNode(SDFFromUrlCopNode, CATEGORY_COP.SDF);
		poly.registerNode(SnapshotCopNode, CATEGORY_COP.MISC);
		poly.registerNode(SwitchCopNode, CATEGORY_COP.MISC);
		poly.registerNode(TexturePropertiesCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(VideoCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(WebCamCopNode, CATEGORY_COP.ADVANCED);
		poly.registerNode(WebXRARCopNode, CATEGORY_COP.ADVANCED);
		// networks
		poly.registerNode(ActorsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(AnimationsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(AudioNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(CopNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(EventsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(MaterialsNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(PostProcessNetworkCopNode, CATEGORY_COP.NETWORK);
		poly.registerNode(RenderersNetworkCopNode, CATEGORY_COP.NETWORK);
	}
}
