import {TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

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
	}
	abstract userInputEventNames(): string[];
}

class BaseUserInputActorParamsConfig extends NodeParamsConfig {}

export type BaseUserInputActorNodeType = BaseUserInputActorNode<BaseUserInputActorParamsConfig>;
