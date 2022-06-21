import {TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';

export abstract class BaseUserInputActorNode<K extends NodeParamsConfig> extends TypedActorNode<K> {
	override initializeNode() {
		const register = () => {
			this.scene().eventsDispatcher.registerActorNode(this);
		};
		const unregister = () => {
			this.scene().eventsDispatcher.unregisterActorNode(this);
		};
		this.lifecycle.onAfterAdded(register);
		this.lifecycle.onBeforeDeleted(unregister);
		// we need the dirtyController in case the element param has changed
		this.dirtyController.addPostDirtyHook('userInputUpdate', () => {
			this.scene().eventsDispatcher.registerActorNode(this);
		});
	}
	abstract userInputEventNames(): string[];
	eventEmitter(): CoreEventEmitter {
		return CoreEventEmitter.CANVAS;
	}
}

class BaseUserInputActorParamsConfig extends NodeParamsConfig {}

export type BaseUserInputActorNodeType = BaseUserInputActorNode<BaseUserInputActorParamsConfig>;
