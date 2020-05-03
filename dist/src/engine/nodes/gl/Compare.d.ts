import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { GlConnectionsController } from './utils/ConnectionsController';
declare class CompareGlParamsConfig extends NodeParamsConfig {
    test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class CompareGlNode extends TypedGlNode<CompareGlParamsConfig> {
    params_config: CompareGlParamsConfig;
    static type(): string;
    readonly gl_connections_controller: GlConnectionsController;
    initialize_node(): void;
    protected _gl_input_name(index: number): string;
    protected _expected_input_type(): GlConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
