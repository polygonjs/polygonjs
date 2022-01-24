import {ParamValuesTypeMap} from '../../engine/params/types/ParamValuesTypeMap';
import {ParamType} from '../../engine/poly/ParamType';
import {PolyDictionary} from '../../types/GlobalTypes';

export type DefaultOperationParam<T extends ParamType> = ParamValuesTypeMap[T];
export type DefaultOperationParams = PolyDictionary<DefaultOperationParam<ParamType>>;
