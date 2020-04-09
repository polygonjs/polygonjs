import {CATEGORY_POST} from './Category';

import {AfterImagePostNode} from '../../nodes/post/AfterImage';
import {BleachPostNode} from '../../nodes/post/Bleach';
import {ClearPostNode} from '../../nodes/post/Clear';
import {ClearMaskPostNode} from '../../nodes/post/ClearMask';
import {CopyPostNode} from '../../nodes/post/Copy';
import {DotScreenPostNode} from '../../nodes/post/DotScreen';
import {FilmPostNode} from '../../nodes/post/Film';
import {ImagePostNode} from '../../nodes/post/Image';
import {MaskPostNode} from '../../nodes/post/Mask';
import {NullPostNode} from '../../nodes/post/Null';
import {PixelPostNode} from '../../nodes/post/Pixel';
import {RenderPostNode} from '../../nodes/post/Render';
import {RGBShiftPostNode} from '../../nodes/post/RGBShift';
import {SepiaPostNode} from '../../nodes/post/Sepia';
import {UnrealBloomPostNode} from '../../nodes/post/UnrealBloom';
import {VignettePostNode} from '../../nodes/post/Vignette';

export interface PostNodeChildrenMap {
	after_image: AfterImagePostNode;
	bleach: BleachPostNode;
	clear: ClearPostNode;
	clear_mask: ClearMaskPostNode;
	copy: CopyPostNode;
	dot_screen: DotScreenPostNode;
	film: FilmPostNode;
	image: ImagePostNode;
	masl: MaskPostNode;
	null: NullPostNode;
	pixel: PixelPostNode;
	render: RenderPostNode;
	rgb_shift: RGBShiftPostNode;
	sepia: SepiaPostNode;
	unreal_bloom: UnrealBloomPostNode;
	vignette: VignettePostNode;
}

import {Poly} from '../../Poly';
export class PostRegister {
	static run(poly: Poly) {
		poly.register_node(AfterImagePostNode, CATEGORY_POST.PASS);
		poly.register_node(BleachPostNode, CATEGORY_POST.PASS);
		poly.register_node(ClearPostNode, CATEGORY_POST.PASS);
		poly.register_node(ClearMaskPostNode, CATEGORY_POST.PASS);
		poly.register_node(CopyPostNode, CATEGORY_POST.PASS);
		poly.register_node(DotScreenPostNode, CATEGORY_POST.PASS);
		poly.register_node(FilmPostNode, CATEGORY_POST.PASS);
		poly.register_node(ImagePostNode, CATEGORY_POST.PASS);
		poly.register_node(MaskPostNode, CATEGORY_POST.PASS);
		poly.register_node(NullPostNode, CATEGORY_POST.PASS);
		poly.register_node(PixelPostNode, CATEGORY_POST.PASS);
		poly.register_node(RenderPostNode, CATEGORY_POST.PASS);
		poly.register_node(RGBShiftPostNode, CATEGORY_POST.PASS);
		poly.register_node(SepiaPostNode, CATEGORY_POST.PASS);
		poly.register_node(UnrealBloomPostNode, CATEGORY_POST.PASS);
		poly.register_node(VignettePostNode, CATEGORY_POST.PASS);
	}
}
