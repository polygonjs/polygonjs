import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BaseAdaptiveParamsConfig extends NodeParamsConfig {
}
export declare abstract class BaseAdaptiveGlNode<T extends BaseAdaptiveParamsConfig> extends TypedGlNode<T> {
    initialize_node(): void;
}
export {};
