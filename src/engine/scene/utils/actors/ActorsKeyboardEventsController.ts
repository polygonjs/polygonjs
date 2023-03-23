// import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';
import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';

import type {OnKeydownJsNode} from '../../../nodes/js/OnKeydown';
import type {OnKeypressJsNode} from '../../../nodes/js/OnKeypress';
import type {OnKeyupJsNode} from '../../../nodes/js/OnKeyup';
export type KeyboardEventActorNode = OnKeypressJsNode | OnKeydownJsNode | OnKeyupJsNode;

export class ActorKeyboardEventsController {
	protected _scene: PolyScene;
	// private _triggeredNodes: Set<ActorBuilderNode> = new Set();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	// setTriggeredNodes(nodes: Set<ActorBuilderNode>) {
	// 	nodes.forEach((node) => {
	// 		this._triggeredNodes.add(node);
	// 	});
	// }
	runTriggers() {
		console.warn('to update');
	}
}
