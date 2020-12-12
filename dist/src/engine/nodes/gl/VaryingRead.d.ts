import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class VaryingReadGlParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class VaryingReadGlNode extends TypedGlNode<VaryingReadGlParamsConfig> {
    params_config: VaryingReadGlParamsConfig;
    static type(): Readonly<'varying_read'>;
    static readonly OUTPUT_NAME = "fragment";
    private _on_create_set_name_if_none_bound;
    initialize_node(): void;
    get output_name(): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    get attribute_name(): string;
    gl_type(): GlConnectionPointType;
    set_gl_type(type: GlConnectionPointType): void;
    private _on_create_set_name_if_none;
}
export {};
