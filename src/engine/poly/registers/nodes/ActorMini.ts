import {CATEGORY_ACTOR} from './Category';

import {CodeActorNode} from '../../../nodes/actor/Code';
import {LookAtActorNode} from '../../../nodes/actor/LookAt';
import {NullActorNode} from '../../../nodes/actor/Null';
import {ScaleObjectActorNode} from '../../../nodes/actor/ScaleObject';

export interface ActorNodeChildrenMap {
	code: CodeActorNode;
	lookAt: LookAtActorNode;
	null: NullActorNode;
	scaleObject: ScaleObjectActorNode;
}

import {PolyEngine} from '../../../Poly';
export class ActorRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CodeActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(LookAtActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(NullActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(ScaleObjectActorNode, CATEGORY_ACTOR.MISC);
	}
}
