import {CATEGORY_ANIM} from './Category';

import {DeleteAnimNode} from '../../../nodes/anim/Delete';
import {NullAnimNode} from '../../../nodes/anim/Null';
import {MergeAnimNode} from '../../../nodes/anim/Merge';
import {TrackAnimNode} from '../../../nodes/anim/Track';
import {TransformAnimNode} from '../../../nodes/anim/Transform';

export interface AnimNodeChildrenMap {
	merge: MergeAnimNode;
	null: NullAnimNode;
	track: TrackAnimNode;
	transform: TransformAnimNode;
}

import {Poly} from '../../../Poly';
export class AnimRegister {
	static run(poly: Poly) {
		poly.register_node(DeleteAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(NullAnimNode, CATEGORY_ANIM.MISC);
		poly.register_node(TrackAnimNode, CATEGORY_ANIM.INPUT);
		poly.register_node(TransformAnimNode, CATEGORY_ANIM.INPUT);
	}
}
