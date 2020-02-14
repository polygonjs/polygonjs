import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
// import {ParamValuesTypeMap} from 'src/engine/nodes/utils/params/ParamsController';

export abstract class Single<T extends ParamType> extends TypedParam<T> {}
