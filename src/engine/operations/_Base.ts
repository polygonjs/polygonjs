import {NodeContext} from '../../engine/poly/NodeContext';
import {ParamType} from '../../engine/poly/ParamType';
import {ParamValuesTypeMap} from '../../engine/params/types/ParamValuesTypeMap';
import {StatesController} from '../../engine/nodes/utils/StatesController';
import {PolyScene} from '../../engine/scene/PolyScene';
import {InputCloneMode} from '../../engine/poly/InputCloneMode';
import {PolyDictionary} from '../../types/GlobalTypes';
import {BaseNodeType} from '../nodes/_Base';

export type DefaultOperationParam<T extends ParamType> = ParamValuesTypeMap[T];
export type DefaultOperationParams = PolyDictionary<DefaultOperationParam<ParamType>>;

export const OPERATIONS_COMPOSER_NODE_TYPE: Readonly<string> = 'operationsComposer';

export class BaseOperation<NC extends NodeContext> {
	static type(): string {
		throw 'type to be overriden';
	}
	type() {
		const c = this.constructor as typeof BaseOperation;
		return c.type();
	}
	static context(): NodeContext {
		console.error('operation has no node_context', this);
		throw 'context requires override';
	}
	context(): NodeContext {
		const c = this.constructor as typeof BaseOperation;
		return c.context();
	}

	static readonly DEFAULT_PARAMS: DefaultOperationParams = {};
	static readonly INPUT_CLONED_STATE: InputCloneMode | InputCloneMode[] = [];

	constructor(protected _scene: PolyScene, protected states?: StatesController<NC>, protected _node?: BaseNodeType) {}
	scene() {
		return this._scene;
	}
	cook(input_contents: any[], params: object): any {}
}
