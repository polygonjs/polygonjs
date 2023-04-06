import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';
// import { EvaluatorMethodName } from './code/assemblers/actor/Evaluator';

export abstract class BaseUserInputJsNode<K extends NodeParamsConfig> extends TypedJsNode<K> {
	// override initializeNode() {
	// 	const register = () => {
	// 		this.scene().eventsDispatcher.registerJsNode(this);
	// 	};
	// 	const unregister = () => {
	// 		this.scene().eventsDispatcher.unregisterJsNode(this);
	// 	};
	// 	this.lifecycle.onAfterAdded(register);
	// 	this.lifecycle.onBeforeDeleted(unregister);
	// 	// we need the dirtyController in case the element param has changed
	// 	// this.dirtyController.addPostDirtyHook('userInputUpdate', () => {
	// 	// 	this.scene().eventsDispatcher.registerJsNode(this);
	// 	// });
	// }
	// abstract userInputEventNames(): string[];
	eventEmitter(): CoreEventEmitter {
		return CoreEventEmitter.CANVAS;
	}
	// abstract methodName(): EvaluatorMethodName;
}

class BaseUserInputJsParamsConfig extends NodeParamsConfig {}

export type BaseUserInputJsNodeType = BaseUserInputJsNode<BaseUserInputJsParamsConfig>;
