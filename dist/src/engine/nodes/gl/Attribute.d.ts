import { TypedGlNode, BaseGlNodeType } from './_Base';
import { GlConnectionPointType, BaseGlConnectionPoint } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { GlNodeType } from '../../poly/NodeContext';
declare class AttributeGlParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    texport_when_connected: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    export_when_connected: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class AttributeGlNode extends TypedGlNode<AttributeGlParamsConfig> {
    params_config: AttributeGlParamsConfig;
    static type(): Readonly<GlNodeType.ATTRIBUTE>;
    static readonly INPUT_NAME = "in";
    static readonly OUTPUT_NAME = "val";
    private _on_create_set_name_if_none_bound;
    initialize_node(): void;
    get input_name(): string;
    get output_name(): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    get attribute_name(): string;
    gl_type(): GlConnectionPointType;
    set_gl_type(type: GlConnectionPointType): void;
    connected_input_node(): BaseGlNodeType | null;
    connected_input_connection_point(): BaseGlConnectionPoint | undefined;
    output_connection_point(): BaseGlConnectionPoint | undefined;
    get is_importing(): boolean;
    get is_exporting(): boolean;
    private _set_mat_to_recompile_if_is_exporting;
    private _on_create_set_name_if_none;
}
export {};
