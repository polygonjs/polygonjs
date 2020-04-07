import {CATEGORY_POST} from './Category';

import {NullPostNode} from '../../nodes/post/Null';
import {PixelPostNode} from '../../nodes/post/Pixel';
import {RenderPostNode} from '../../nodes/post/Render';
import {UnrealBloomPostNode} from '../../nodes/post/UnrealBloom';

export interface PostNodeChildrenMap {
	null: NullPostNode;
	pixel: PixelPostNode;
	render: RenderPostNode;
	unreal_bloom: UnrealBloomPostNode;
}

import {Poly} from '../../Poly';
export class PostRegister {
	static run(poly: Poly) {
		poly.register_node(NullPostNode, CATEGORY_POST.PASS);
		poly.register_node(PixelPostNode, CATEGORY_POST.PASS);
		poly.register_node(RenderPostNode, CATEGORY_POST.PASS);
		poly.register_node(UnrealBloomPostNode, CATEGORY_POST.PASS);
	}
}
