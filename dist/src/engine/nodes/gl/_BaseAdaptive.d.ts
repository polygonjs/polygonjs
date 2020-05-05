import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { GlConnectionsController } from './utils/ConnectionsController';
declare class BaseAdaptiveParamsConfig extends NodeParamsConfig {
}
export declare abstract class BaseAdaptiveGlNode<T extends BaseAdaptiveParamsConfig> extends TypedGlNode<T> {
    readonly gl_connections_controller: GlConnectionsController;
    initialize_node(): void;
}
export {};
