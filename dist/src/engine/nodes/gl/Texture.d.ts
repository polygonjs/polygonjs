import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { ParamType } from '../../poly/ParamType';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TextureParamsConfig extends NodeParamsConfig {
    param_name: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    default_value: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    uv: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.VECTOR2>;
}
export declare class TextureGlNode extends TypedGlNode<TextureParamsConfig> {
    params_config: TextureParamsConfig;
    static type(): Readonly<'texture'>;
    static readonly OUTPUT_NAME = "rgba";
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    set_param_configs(): void;
    private _uniform_name;
}
export {};
