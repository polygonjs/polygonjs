import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';

export abstract class BaseUserInputJsNode<K extends NodeParamsConfig> extends TypedJsNode<K> {
	override isTriggering() {
		return true;
	}
	eventEmitter(): CoreEventEmitter {
		return CoreEventEmitter.CANVAS;
	}
}

class BaseUserInputJsParamsConfig extends NodeParamsConfig {}

export type BaseUserInputJsNodeType = BaseUserInputJsNode<BaseUserInputJsParamsConfig>;
