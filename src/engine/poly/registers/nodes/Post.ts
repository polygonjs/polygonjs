import {CATEGORY_POST} from './Category';

import {AdaptiveToneMappingPostNode} from '../../../nodes/post/AdaptiveToneMapping';
import {AfterImagePostNode} from '../../../nodes/post/AfterImage';
import {AnimationsPostNode} from '../../../nodes/post/Animations';
import {BleachPostNode} from '../../../nodes/post/Bleach';
import {BrightnessContrastPostNode} from '../../../nodes/post/BrightnessContrast';
import {ClearPostNode} from '../../../nodes/post/Clear';
import {ClearMaskPostNode} from '../../../nodes/post/ClearMask';
import {ColorCorrectionPostNode} from '../../../nodes/post/ColorCorrection';
import {CopPostNode} from '../../../nodes/post/Cop';
import {CopyPostNode} from '../../../nodes/post/Copy';
import {DepthOfFieldPostNode} from '../../../nodes/post/DepthOfField';
import {DotScreenPostNode} from '../../../nodes/post/DotScreen';
import {EventsPostNode} from '../../../nodes/post/Events';
import {FilmPostNode} from '../../../nodes/post/Film';
import {FXAAPostNode} from '../../../nodes/post/FXAA';
import {GammaCorrectionPostNode} from '../../../nodes/post/GammaCorrection';
import {HorizontalBlurPostNode} from '../../../nodes/post/HorizontalBlur';
import {ImagePostNode} from '../../../nodes/post/Image';
import {LayerPostNode} from '../../../nodes/post/Layer';
import {MaskPostNode} from '../../../nodes/post/Mask';
import {MaterialsPostNode} from '../../../nodes/post/Materials';
import {NullPostNode} from '../../../nodes/post/Null';
import {OutlinePostNode} from '../../../nodes/post/Outline';
import {PixelPostNode} from '../../../nodes/post/Pixel';
import {PostProcessPostNode} from '../../../nodes/post/PostProcess';
import {RenderPostNode} from '../../../nodes/post/Render';
import {RenderersPostNode} from '../../../nodes/post/Renderers';
import {RGBShiftPostNode} from '../../../nodes/post/RGBShift';
import {SepiaPostNode} from '../../../nodes/post/Sepia';
import {SequencePostNode} from '../../../nodes/post/Sequence';
import {TriangleBlurPostNode} from '../../../nodes/post/TriangleBlur';
import {UnrealBloomPostNode} from '../../../nodes/post/UnrealBloom';
import {VerticalBlurPostNode} from '../../../nodes/post/VerticalBlur';
import {VignettePostNode} from '../../../nodes/post/Vignette';

export interface PostNodeChildrenMap {
	adaptiveToneMapping: AdaptiveToneMappingPostNode;
	afterImage: AfterImagePostNode;
	bleach: BleachPostNode;
	brightnessContrast: BrightnessContrastPostNode;
	clear: ClearPostNode;
	clearMask: ClearMaskPostNode;
	colorCorrection: ColorCorrectionPostNode;
	copy: CopyPostNode;
	depthOfField: DepthOfFieldPostNode;
	dotScreen: DotScreenPostNode;
	film: FilmPostNode;
	FXAA: FXAAPostNode;
	gammaCorrection: GammaCorrectionPostNode;
	horizontalBlur: HorizontalBlurPostNode;
	image: ImagePostNode;
	layer: LayerPostNode;
	mask: MaskPostNode;
	null: NullPostNode;
	outline: OutlinePostNode;
	pixel: PixelPostNode;
	render: RenderPostNode;
	RGBShift: RGBShiftPostNode;
	sepia: SepiaPostNode;
	sequence: SequencePostNode;
	triangleBlur: TriangleBlurPostNode;
	unrealBloom: UnrealBloomPostNode;
	verticalBlur: VerticalBlurPostNode;
	vignette: VignettePostNode;
	// networks
	animations: AnimationsPostNode;
	cop: CopPostNode;
	events: EventsPostNode;
	materials: MaterialsPostNode;
	postProcess: PostProcessPostNode;
	renderers: RenderersPostNode;
}

import {PolyEngine} from '../../../Poly';
export class PostRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(AdaptiveToneMappingPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(AfterImagePostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(BleachPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(BrightnessContrastPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(ClearPostNode, CATEGORY_POST.MISC);
		poly.registerNode(ClearMaskPostNode, CATEGORY_POST.MISC);
		poly.registerNode(ColorCorrectionPostNode, CATEGORY_POST.MISC);
		poly.registerNode(CopyPostNode, CATEGORY_POST.MISC);
		poly.registerNode(DotScreenPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(DepthOfFieldPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(FilmPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(FXAAPostNode, CATEGORY_POST.MISC);
		poly.registerNode(GammaCorrectionPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(HorizontalBlurPostNode, CATEGORY_POST.BLUR);
		poly.registerNode(ImagePostNode, CATEGORY_POST.MISC);
		poly.registerNode(LayerPostNode, CATEGORY_POST.MISC);
		poly.registerNode(MaskPostNode, CATEGORY_POST.MISC);
		poly.registerNode(NullPostNode, CATEGORY_POST.MISC);
		poly.registerNode(OutlinePostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(PixelPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(RenderPostNode, CATEGORY_POST.MISC);
		poly.registerNode(RGBShiftPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(SepiaPostNode, CATEGORY_POST.COLOR);
		poly.registerNode(SequencePostNode, CATEGORY_POST.MISC);
		poly.registerNode(TriangleBlurPostNode, CATEGORY_POST.BLUR);
		poly.registerNode(UnrealBloomPostNode, CATEGORY_POST.EFFECT);
		poly.registerNode(VerticalBlurPostNode, CATEGORY_POST.BLUR);
		poly.registerNode(VignettePostNode, CATEGORY_POST.EFFECT);
		// netwoks
		poly.registerNode(AnimationsPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(CopPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(EventsPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(MaterialsPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(PostProcessPostNode, CATEGORY_POST.NETWORK);
		poly.registerNode(RenderersPostNode, CATEGORY_POST.NETWORK);
	}
}
