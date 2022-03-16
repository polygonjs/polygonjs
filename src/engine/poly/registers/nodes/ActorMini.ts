import {CATEGORY_ACTOR} from './Category';

import {CodeActorNode} from '../../../nodes/actor/Code';
import {LookAtActorNode} from '../../../nodes/actor/LookAt';
import {NullActorNode} from '../../../nodes/actor/Null';

export interface ActorNodeChildrenMap {
	code: CodeActorNode;
	lookAt: LookAtActorNode;
	null: NullActorNode;
}

import {PolyEngine} from '../../../Poly';
export class ActorRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CodeActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(LookAtActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(NullActorNode, CATEGORY_ACTOR.MISC);
	}
}
