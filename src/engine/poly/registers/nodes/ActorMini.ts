import {CATEGORY_ACTOR} from './Category';

import {CodeActorNode} from '../../../nodes/actor/Code';
import {HoveredActorNode} from '../../../nodes/actor/Hovered';
import {LookAtActorNode} from '../../../nodes/actor/LookAt';
import {NullActorNode} from '../../../nodes/actor/Null';
import {ScaleActorNode} from '../../../nodes/actor/Scale';

export interface ActorNodeChildrenMap {
	code: CodeActorNode;
	hovered: HoveredActorNode;
	lookAt: LookAtActorNode;
	null: NullActorNode;
	scale: ScaleActorNode;
}

import {PolyEngine} from '../../../Poly';
export class ActorRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CodeActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(HoveredActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(LookAtActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(NullActorNode, CATEGORY_ACTOR.MISC);
		poly.registerNode(ScaleActorNode, CATEGORY_ACTOR.MISC);
	}
}
