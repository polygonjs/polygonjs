import { NodeContext } from '../../engine/poly/NodeContext';
import { ParamType } from '../../engine/poly/ParamType';
import { ParamValuesTypeMap } from '../../engine/params/types/ParamValuesTypeMap';
import { StatesController } from '../../engine/nodes/utils/StatesController';
import { PolyScene } from '../../engine/scene/PolyScene';
import { InputCloneMode } from '../../engine/poly/InputCloneMode';
export declare type DefaultOperationParam<T extends ParamType> = ParamValuesTypeMap[T];
export declare type DefaultOperationParams = Dictionary<DefaultOperationParam<ParamType>>;
export declare const OPERATIONS_COMPOSER_NODE_TYPE: Readonly<string>;
export declare class BaseOperation {
    protected scene: PolyScene;
    protected states?: StatesController | undefined;
    static type(): string;
    type(): string;
    static context(): NodeContext;
    context(): NodeContext;
    static readonly DEFAULT_PARAMS: DefaultOperationParams;
    static readonly INPUT_CLONED_STATE: InputCloneMode | InputCloneMode[];
    constructor(scene: PolyScene, states?: StatesController | undefined);
    cook(input_contents: any[], params: object): any;
}
