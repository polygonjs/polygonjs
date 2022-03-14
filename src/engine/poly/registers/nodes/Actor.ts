import {CATEGORY_ACTOR} from './Category';

export const ACTORS_IN_PROD = false;

import {CodeActorNode} from '../../../nodes/actor/Code';
import {ConstantActorNode} from '../../../nodes/actor/Constant';
import {GetObjectActorNode} from '../../../nodes/actor/GetObject';
import {GetObjectPropertyActorNode} from '../../../nodes/actor/GetObjectProperty';
import {HoveredActorNode} from '../../../nodes/actor/Hovered';
import {LookAtActorNode} from '../../../nodes/actor/LookAt';
import {MultScalarActorNode} from '../../../nodes/actor/MultScalar';
import {NullActorNode} from '../../../nodes/actor/Null';
import {OnEventTickActorNode} from '../../../nodes/actor/OnEventTick';
import {OnObjectAttributeUpdatedActorNode} from '../../../nodes/actor/OnObjectAttributeUpdated';
import {ScaleObjectActorNode} from '../../../nodes/actor/ScaleObject';
import {SetObjectPositionActorNode} from '../../../nodes/actor/SetObjectPosition';

export interface ActorNodeChildrenMap {
	code: CodeActorNode;
	constant: ConstantActorNode;
	getObject: GetObjectActorNode;
	GetObjectProperty: GetObjectPropertyActorNode;
	hovered: HoveredActorNode;
	lookAt: LookAtActorNode;
	multScalar: MultScalarActorNode;
	null: NullActorNode;
	onEventTick: OnEventTickActorNode;
	onObjectAttributeUpdated: OnObjectAttributeUpdatedActorNode;
	scaleObject: ScaleObjectActorNode;
	setObjectPosition: SetObjectPositionActorNode;
}

import {PolyEngine} from '../../../Poly';
export class ActorRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CodeActorNode, CATEGORY_ACTOR.ADVANCED);
		poly.registerNode(ConstantActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(GetObjectActorNode, CATEGORY_ACTOR.GET);
		poly.registerNode(GetObjectPropertyActorNode, CATEGORY_ACTOR.GET);
		poly.registerNode(HoveredActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(LookAtActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(MultScalarActorNode, CATEGORY_ACTOR.MATH);
		poly.registerNode(NullActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(OnEventTickActorNode, CATEGORY_ACTOR.EVENTS);
		poly.registerNode(OnObjectAttributeUpdatedActorNode, CATEGORY_ACTOR.EVENTS);
		poly.registerNode(ScaleObjectActorNode, CATEGORY_ACTOR.SET);
		poly.registerNode(SetObjectPositionActorNode, CATEGORY_ACTOR.SET);
	}
}
