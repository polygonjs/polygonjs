import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class VaryingWriteGlParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class VaryingWriteGlNode extends TypedGlNode<VaryingWriteGlParamsConfig> {
    params_config: VaryingWriteGlParamsConfig;
    static type(): Readonly<'varying_write'>;
    static readonly INPUT_NAME = "vertex";
    private _on_create_set_name_if_none_bound;
    initialize_node(): void;
    get input_name(): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    get attribute_name(): string;
    gl_type(): GlConnectionPointType | undefined;
    set_gl_type(type: GlConnectionPointType): void;
    private _on_create_set_name_if_none;
}
export {};
