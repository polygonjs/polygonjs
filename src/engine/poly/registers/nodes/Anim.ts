import {CATEGORY_ANIM} from './Category';

import {DelayAnimNode} from '../../../nodes/anim/Delay';
import {DurationAnimNode} from '../../../nodes/anim/Duration';
import {EasingAnimNode} from '../../../nodes/anim/Easing';
import {MergeAnimNode} from '../../../nodes/anim/Merge';
import {NullAnimNode} from '../../../nodes/anim/Null';
import {OperationAnimNode} from '../../../nodes/anim/Operation';
import {PositionAnimNode} from '../../../nodes/anim/Position';
import {PropertyAnimNode} from '../../../nodes/anim/Property';
import {RepeatAnimNode} from '../../../nodes/anim/Repeat';
import {SwitchAnimNode} from '../../../nodes/anim/Switch';
import {TargetAnimNode} from '../../../nodes/anim/Target';

export interface AnimNodeChildrenMap {
	delay: DelayAnimNode;
	duration: DurationAnimNode;
	easing: EasingAnimNode;
	merge: MergeAnimNode;
	null: NullAnimNode;
	operation: OperationAnimNode;
	position: PositionAnimNode;
	property: PropertyAnimNode;
	repeat: RepeatAnimNode;
	switch: SwitchAnimNode;
	target: TargetAnimNode;
}

import {Poly} from '../../../Poly';
export class AnimRegister {
	static run(poly: Poly) {
		poly.register_node(DelayAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(DurationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(EasingAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(NullAnimNode, CATEGORY_ANIM.MISC);
		poly.register_node(OperationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(PositionAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(PropertyAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(RepeatAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(SwitchAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.register_node(TargetAnimNode, CATEGORY_ANIM.MODIFIER);
	}
}
