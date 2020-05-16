import {CATEGORY_POST} from './Category';

import {AfterImagePostNode} from '../../../nodes/post/AfterImage';
import {BleachPostNode} from '../../../nodes/post/Bleach';
import {BrightnessContrastPostNode} from '../../../nodes/post/BrightnessContrast';
import {ClearPostNode} from '../../../nodes/post/Clear';
import {ClearMaskPostNode} from '../../../nodes/post/ClearMask';
import {ColorCorrectionPostNode} from '../../../nodes/post/ColorCorrection';
import {CopyPostNode} from '../../../nodes/post/Copy';
import {DepthOfFieldPostNode} from '../../../nodes/post/DepthOfField';
import {DotScreenPostNode} from '../../../nodes/post/DotScreen';
import {FilmPostNode} from '../../../nodes/post/Film';
import {FXAAPostNode} from '../../../nodes/post/FXAA';
import {GammaCorrectionPostNode} from '../../../nodes/post/GammaCorrection';
import {HorizontalBlurPostNode} from '../../../nodes/post/HorizontalBlur';
import {ImagePostNode} from '../../../nodes/post/Image';
import {LayerPostNode} from '../../../nodes/post/Layer';
import {MaskPostNode} from '../../../nodes/post/Mask';
import {NullPostNode} from '../../../nodes/post/Null';
import {OutlinePostNode} from '../../../nodes/post/Outline';
import {PixelPostNode} from '../../../nodes/post/Pixel';
import {RenderPostNode} from '../../../nodes/post/Render';
import {RGBShiftPostNode} from '../../../nodes/post/RGBShift';
import {SepiaPostNode} from '../../../nodes/post/Sepia';
import {SequencePostNode} from '../../../nodes/post/Sequence';
import {TriangleBlurPostNode} from '../../../nodes/post/TriangleBlur';
import {UnrealBloomPostNode} from '../../../nodes/post/UnrealBloom';
import {VerticalBlurPostNode} from '../../../nodes/post/VerticalBlur';
import {VignettePostNode} from '../../../nodes/post/Vignette';

export interface PostNodeChildrenMap {
	after_image: AfterImagePostNode;
	bleach: BleachPostNode;
	brightness_contrast: BrightnessContrastPostNode;
	clear: ClearPostNode;
	clear_mask: ClearMaskPostNode;
	color_correction: ColorCorrectionPostNode;
	copy: CopyPostNode;
	depth_of_field: DepthOfFieldPostNode;
	dot_screen: DotScreenPostNode;
	film: FilmPostNode;
	fxaa: FXAAPostNode;
	gamma_correction: GammaCorrectionPostNode;
	horizontal_blur: HorizontalBlurPostNode;
	image: ImagePostNode;
	layer: LayerPostNode;
	mask: MaskPostNode;
	null: NullPostNode;
	outline: OutlinePostNode;
	pixel: PixelPostNode;
	render: RenderPostNode;
	rgb_shift: RGBShiftPostNode;
	sepia: SepiaPostNode;
	sequence: SequencePostNode;
	triangle_blur: TriangleBlurPostNode;
	unreal_bloom: UnrealBloomPostNode;
	vertical_blur: VerticalBlurPostNode;
	vignette: VignettePostNode;
}

import {Poly} from '../../../Poly';
export class PostRegister {
	static run(poly: Poly) {
		poly.register_node(AfterImagePostNode, CATEGORY_POST.EFFECT);
		poly.register_node(BleachPostNode, CATEGORY_POST.COLOR);
		poly.register_node(BrightnessContrastPostNode, CATEGORY_POST.COLOR);
		poly.register_node(ClearPostNode, CATEGORY_POST.MISC);
		poly.register_node(ClearMaskPostNode, CATEGORY_POST.MISC);
		poly.register_node(ColorCorrectionPostNode, CATEGORY_POST.MISC);
		poly.register_node(CopyPostNode, CATEGORY_POST.MISC);
		poly.register_node(DotScreenPostNode, CATEGORY_POST.EFFECT);
		poly.register_node(DepthOfFieldPostNode, CATEGORY_POST.EFFECT);
		poly.register_node(FilmPostNode, CATEGORY_POST.EFFECT);
		poly.register_node(FXAAPostNode, CATEGORY_POST.MISC);
		poly.register_node(GammaCorrectionPostNode, CATEGORY_POST.COLOR);
		poly.register_node(HorizontalBlurPostNode, CATEGORY_POST.BLUR);
		poly.register_node(ImagePostNode, CATEGORY_POST.MISC);
		poly.register_node(LayerPostNode, CATEGORY_POST.MISC);
		poly.register_node(MaskPostNode, CATEGORY_POST.MISC);
		poly.register_node(NullPostNode, CATEGORY_POST.MISC);
		poly.register_node(OutlinePostNode, CATEGORY_POST.EFFECT);
		poly.register_node(PixelPostNode, CATEGORY_POST.EFFECT);
		poly.register_node(RenderPostNode, CATEGORY_POST.MISC);
		poly.register_node(RGBShiftPostNode, CATEGORY_POST.EFFECT);
		poly.register_node(SepiaPostNode, CATEGORY_POST.COLOR);
		poly.register_node(SequencePostNode, CATEGORY_POST.MISC);
		poly.register_node(TriangleBlurPostNode, CATEGORY_POST.BLUR);
		poly.register_node(UnrealBloomPostNode, CATEGORY_POST.EFFECT);
		poly.register_node(VerticalBlurPostNode, CATEGORY_POST.BLUR);
		poly.register_node(VignettePostNode, CATEGORY_POST.EFFECT);
	}
}
