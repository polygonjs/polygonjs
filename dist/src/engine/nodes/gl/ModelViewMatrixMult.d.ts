import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class ModelViewMatrixMultGlParamsConfig extends NodeParamsConfig {
    vector: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class ModelViewMatrixMultGlNode extends TypedGlNode<ModelViewMatrixMultGlParamsConfig> {
    params_config: ModelViewMatrixMultGlParamsConfig;
    static type(): Readonly<'model_view_matrix_mult'>;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};
