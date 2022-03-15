import {CATEGORY_ACTOR} from './Category';

export const ACTORS_IN_PROD = false;

import {CodeActorNode} from '../../../nodes/actor/Code';
import {ConstantActorNode} from '../../../nodes/actor/Constant';
import {GetObjectActorNode} from '../../../nodes/actor/GetObject';
import {GetObjectAttributeActorNode} from '../../../nodes/actor/GetObjectAttribute';
import {GetObjectPropertyActorNode} from '../../../nodes/actor/GetObjectProperty';
import {LookAtActorNode} from '../../../nodes/actor/LookAt';
import {MultScalarActorNode} from '../../../nodes/actor/MultScalar';
import {NullActorNode} from '../../../nodes/actor/Null';
import {OnEventSceneResetActorNode} from '../../../nodes/actor/OnEventSceneReset';
import {OnEventTickActorNode} from '../../../nodes/actor/OnEventTick';
import {OnObjectAttributeUpdatedActorNode} from '../../../nodes/actor/OnObjectAttributeUpdated';
import {ScaleObjectActorNode} from '../../../nodes/actor/ScaleObject';
import {SetHoveredStateActorNode} from '../../../nodes/actor/SetHoveredState';
import {SetObjectPositionActorNode} from '../../../nodes/actor/SetObjectPosition';
import {PlayAnimationActorNode} from '../../../nodes/actor/PlayAnimation';
import {TwoWaySwitchActorNode} from '../../../nodes/actor/TwoWaySwitch';
// networks
import {ActorsNetworkActorNode} from '../../../nodes/actor/ActorsNetwork';
import {AnimationsNetworkActorNode} from '../../../nodes/actor/AnimationsNetwork';
import {AudioNetworkActorNode} from '../../../nodes/actor/AudioNetwork';
import {CopNetworkActorNode} from '../../../nodes/actor/CopNetwork';
import {EventsNetworkActorNode} from '../../../nodes/actor/EventsNetwork';
import {MaterialsNetworkActorNode} from '../../../nodes/actor/MaterialsNetwork';
import {PostProcessNetworkActorNode} from '../../../nodes/actor/PostProcessNetwork';
import {RenderersNetworkActorNode} from '../../../nodes/actor/RenderersNetwork';
export interface ActorNodeChildrenMap {
	code: CodeActorNode;
	constant: ConstantActorNode;
	getObject: GetObjectActorNode;
	getObjectAttribute: GetObjectAttributeActorNode;
	getObjectProperty: GetObjectPropertyActorNode;
	lookAt: LookAtActorNode;
	multScalar: MultScalarActorNode;
	null: NullActorNode;
	onEventSceneReset: OnEventSceneResetActorNode;
	onEventTick: OnEventTickActorNode;
	onObjectAttributeUpdated: OnObjectAttributeUpdatedActorNode;
	scaleObject: ScaleObjectActorNode;
	setHoveredState: SetHoveredStateActorNode;
	setObjectPosition: SetObjectPositionActorNode;
	playAnimation: PlayAnimationActorNode;
	twoWaySwitch: TwoWaySwitchActorNode;
	// networks
	actorsNetwork: ActorsNetworkActorNode;
	animationsNetwork: AnimationsNetworkActorNode;
	audioNetwork: AudioNetworkActorNode;
	copNetwork: CopNetworkActorNode;
	eventsNetwork: EventsNetworkActorNode;
	materialsNetwork: MaterialsNetworkActorNode;
	postProcessNetwork: PostProcessNetworkActorNode;
	renderersNetwork: RenderersNetworkActorNode;
}

import {PolyEngine} from '../../../Poly';
export class ActorRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CodeActorNode, CATEGORY_ACTOR.ADVANCED);
		poly.registerNode(ConstantActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(GetObjectActorNode, CATEGORY_ACTOR.GET);
		poly.registerNode(GetObjectAttributeActorNode, CATEGORY_ACTOR.GET);
		poly.registerNode(GetObjectPropertyActorNode, CATEGORY_ACTOR.GET);
		poly.registerNode(LookAtActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(MultScalarActorNode, CATEGORY_ACTOR.MATH);
		poly.registerNode(NullActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(OnEventSceneResetActorNode, CATEGORY_ACTOR.EVENTS);
		poly.registerNode(OnEventTickActorNode, CATEGORY_ACTOR.EVENTS);
		poly.registerNode(OnObjectAttributeUpdatedActorNode, CATEGORY_ACTOR.EVENTS);
		poly.registerNode(ScaleObjectActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(SetHoveredStateActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(SetObjectPositionActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(PlayAnimationActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(TwoWaySwitchActorNode, CATEGORY_ACTOR.LOGIC);

		// networks
		if (ACTORS_IN_PROD || process.env.NODE_ENV == 'development') {
			poly.registerNode(ActorsNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		}
		poly.registerNode(AnimationsNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		poly.registerNode(AudioNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		poly.registerNode(CopNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		poly.registerNode(EventsNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		poly.registerNode(MaterialsNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		poly.registerNode(PostProcessNetworkActorNode, CATEGORY_ACTOR.NETWORK);
		poly.registerNode(RenderersNetworkActorNode, CATEGORY_ACTOR.NETWORK);
	}
}
