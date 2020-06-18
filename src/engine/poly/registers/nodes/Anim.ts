import {CATEGORY_ANIM} from './Category';

import {DurationAnimNode} from '../../../nodes/anim/Duration';
import {EasingAnimNode} from '../../../nodes/anim/Easing';
import {NullAnimNode} from '../../../nodes/anim/Null';
// import {MergeAnimNode} from '../../../nodes/anim/Merge';
import {PropertyAnimNode} from '../../../nodes/anim/Property';
import {TargetAnimNode} from '../../../nodes/anim/Target';
// import {TransformAnimNode} from '../../../nodes/anim/Transform';

export interface AnimNodeChildrenMap {
	duration: DurationAnimNode;
	easing: EasingAnimNode;
	// delete: DeleteAnimNode;
	// merge: MergeAnimNode;
	null: NullAnimNode;
	property: PropertyAnimNode;
	target: TargetAnimNode;
	// transform: TransformAnimNode;
}

import {Poly} from '../../../Poly';
export class AnimRegister {
	static run(poly: Poly) {
		poly.register_node(DurationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(EasingAnimNode, CATEGORY_ANIM.MODIFIER);
		// poly.register_node(DeleteAnimNode, CATEGORY_ANIM.MODIFIER);
		// poly.register_node(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(NullAnimNode, CATEGORY_ANIM.MISC);
		poly.register_node(PropertyAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(TargetAnimNode, CATEGORY_ANIM.MODIFIER);
		// poly.register_node(TransformAnimNode, CATEGORY_ANIM.INPUT);
	}
}
