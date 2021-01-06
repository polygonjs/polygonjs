import {BaseParamType, TypedParam} from './_Base';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {DecomposedPath} from '../../core/DecomposedPath';

export abstract class TypedPathParam<T extends ParamType> extends TypedParam<T> {
	public readonly decomposed_path = new DecomposedPath();

	abstract notify_path_rebuild_required(node: BaseNodeType | BaseParamType): void;
	abstract notify_target_param_owner_params_updated(node: BaseNodeType | BaseParamType): void;
}
