import {CATEGORY_ANIM} from './Category';

// import {CopyAnimNode} from '../../../nodes/anim/Copy';
import {DelayAnimNode} from '../../../nodes/anim/Delay';
import {DurationAnimNode} from '../../../nodes/anim/Duration';
import {EasingAnimNode} from '../../../nodes/anim/Easing';
// import {KeyframesAnimNode} from '../../../nodes/anim/Keyframes';
import {MergeAnimNode} from '../../../nodes/anim/Merge';
import {NullAnimNode} from '../../../nodes/anim/Null';
import {OperationAnimNode} from '../../../nodes/anim/Operation';
import {PositionAnimNode} from '../../../nodes/anim/Position';
import {PropertyNameAnimNode} from '../../../nodes/anim/PropertyName';
import {PropertyValueAnimNode} from '../../../nodes/anim/PropertyValue';
import {RepeatAnimNode} from '../../../nodes/anim/Repeat';
import {PlayAnimNode} from '../../../nodes/anim/Play';
import {SubnetAnimNode} from '../../../nodes/anim/Subnet';
import {SubnetInputAnimNode} from '../../../nodes/anim/SubnetInput';
import {SubnetOutputAnimNode} from '../../../nodes/anim/SubnetOutput';
import {SwitchAnimNode} from '../../../nodes/anim/Switch';
import {TargetAnimNode} from '../../../nodes/anim/Target';
// networks
import {ActorsNetworkAnimNode} from '../../../nodes/anim/ActorsNetwork';
import {AnimationsNetworkAnimNode} from '../../../nodes/anim/AnimationsNetwork';
import {AudioNetworkAnimNode} from '../../../nodes/anim/AudioNetwork';
import {CopNetworkAnimNode} from '../../../nodes/anim/CopNetwork';
import {EventsNetworkAnimNode} from '../../../nodes/anim/EventsNetwork';
import {MaterialsNetworkAnimNode} from '../../../nodes/anim/MaterialsNetwork';
import {PostProcessNetworkAnimNode} from '../../../nodes/anim/PostProcessNetwork';
import {RenderersNetworkAnimNode} from '../../../nodes/anim/RenderersNetwork';

export interface AnimNodeChildrenMap {
	// copy: CopyAnimNode;
	delay: DelayAnimNode;
	duration: DurationAnimNode;
	easing: EasingAnimNode;
	// keyframes: KeyframesAnimNode;
	merge: MergeAnimNode;
	null: NullAnimNode;
	operation: OperationAnimNode;
	play: PlayAnimNode;
	position: PositionAnimNode;
	propertyName: PropertyNameAnimNode;
	propertyValue: PropertyValueAnimNode;
	repeat: RepeatAnimNode;
	subnet: SubnetAnimNode;
	subnetInput: SubnetInputAnimNode;
	subnetOutput: SubnetOutputAnimNode;
	switch: SwitchAnimNode;
	target: TargetAnimNode;
	// networks
	actorsNetwork: ActorsNetworkAnimNode;
	animationsNetwork: AnimationsNetworkAnimNode;
	audioNetwork: AudioNetworkAnimNode;
	copNetwork: CopNetworkAnimNode;
	eventsNetwork: EventsNetworkAnimNode;
	materialsNetwork: MaterialsNetworkAnimNode;
	postProcessNetwork: PostProcessNetworkAnimNode;
	renderersNetwork: RenderersNetworkAnimNode;
}

import {PolyEngine} from '../../../Poly';
export class AnimRegister {
	static run(poly: PolyEngine) {
		// poly.registerNode(CopyAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(DelayAnimNode, CATEGORY_ANIM.TIMING);
		poly.registerNode(DurationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(EasingAnimNode, CATEGORY_ANIM.MODIFIER);
		// poly.registerNode(KeyframesAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(NullAnimNode, CATEGORY_ANIM.MISC);
		poly.registerNode(OperationAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(PlayAnimNode, CATEGORY_ANIM.MISC);
		poly.registerNode(PositionAnimNode, CATEGORY_ANIM.TIMING);
		poly.registerNode(PropertyNameAnimNode, CATEGORY_ANIM.PROP);
		poly.registerNode(PropertyValueAnimNode, CATEGORY_ANIM.PROP);
		poly.registerNode(RepeatAnimNode, CATEGORY_ANIM.MODIFIER);
		poly.registerNode(SubnetAnimNode, CATEGORY_ANIM.SUBNET);
		poly.registerNode(SubnetInputAnimNode, CATEGORY_ANIM.SUBNET);
		poly.registerNode(SubnetOutputAnimNode, CATEGORY_ANIM.SUBNET);
		poly.registerNode(SwitchAnimNode, CATEGORY_ANIM.MISC);
		poly.registerNode(TargetAnimNode, CATEGORY_ANIM.PROP);
		// networks
		poly.registerNode(ActorsNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(AnimationsNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(AudioNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(CopNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(EventsNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(MaterialsNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(PostProcessNetworkAnimNode, CATEGORY_ANIM.NETWORK);
		poly.registerNode(RenderersNetworkAnimNode, CATEGORY_ANIM.NETWORK);
	}
}
