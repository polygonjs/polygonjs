import {CATEGORY_ANIM} from './Category';

import {AnimationsAnimNode} from '../../../nodes/anim/Animations';
import {CopAnimNode} from '../../../nodes/anim/Cop';
import {CopyAnimNode} from '../../../nodes/anim/Copy';
import {DelayAnimNode} from '../../../nodes/anim/Delay';
import {DurationAnimNode} from '../../../nodes/anim/Duration';
import {EasingAnimNode} from '../../../nodes/anim/Easing';
import {EventsAnimNode} from '../../../nodes/anim/Events';
import {MaterialsAnimNode} from '../../../nodes/anim/Materials';
import {MergeAnimNode} from '../../../nodes/anim/Merge';
import {NullAnimNode} from '../../../nodes/anim/Null';
import {OperationAnimNode} from '../../../nodes/anim/Operation';
import {PositionAnimNode} from '../../../nodes/anim/Position';
import {PostProcessAnimNode} from '../../../nodes/anim/PostProcess';
import {PropertyNameAnimNode} from '../../../nodes/anim/PropertyName';
import {PropertyValueAnimNode} from '../../../nodes/anim/PropertyValue';
import {RenderersAnimNode} from '../../../nodes/anim/Renderers';
import {RepeatAnimNode} from '../../../nodes/anim/Repeat';
import {SwitchAnimNode} from '../../../nodes/anim/Switch';
import {TargetAnimNode} from '../../../nodes/anim/Target';

export interface AnimNodeChildrenMap {
	copy: CopyAnimNode;
	delay: DelayAnimNode;
	duration: DurationAnimNode;
	easing: EasingAnimNode;
	merge: MergeAnimNode;
	null: NullAnimNode;
	operation: OperationAnimNode;
	position: PositionAnimNode;
	propertyName: PropertyNameAnimNode;
	propertyValue: PropertyValueAnimNode;
	repeat: RepeatAnimNode;
	switch: SwitchAnimNode;
	target: TargetAnimNode;
	// networks
	animations: AnimationsAnimNode;
	cop: CopAnimNode;
	events: EventsAnimNode;
	materials: MaterialsAnimNode;
	postProcess: PostProcessAnimNode;
	renderers: RenderersAnimNode;
}

import {Poly} from '../../../Poly';
export class AnimRegister {
	static run(poly: Poly) {
		poly.registerNode(CopyAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(DelayAnimNode, CATEGORY_ANIM.TIMING);
		poly.registerNode(DurationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(EasingAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(NullAnimNode, CATEGORY_ANIM.MISC);
		poly.registerNode(OperationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(PositionAnimNode, CATEGORY_ANIM.TIMING);
		poly.registerNode(PropertyNameAnimNode, CATEGORY_ANIM.PROP);
		poly.registerNode(PropertyValueAnimNode, CATEGORY_ANIM.PROP);
		poly.registerNode(RepeatAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(SwitchAnimNode, CATEGORY_ANIM.MISC);
		poly.registerNode(TargetAnimNode, CATEGORY_ANIM.PROP);
		// networks
		poly.registerNode(AnimationsAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(CopAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(EventsAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(MaterialsAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(PostProcessAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(RenderersAnimNode, CATEGORY_ANIM.NETWORK);
	}
}
