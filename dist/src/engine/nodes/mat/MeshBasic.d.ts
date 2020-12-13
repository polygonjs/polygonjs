/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { TypedMatNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { DepthController } from './utils/DepthController';
import { TextureMapController } from './utils/TextureMapController';
import { TextureAlphaMapController } from './utils/TextureAlphaMapController';
declare const MeshBasicMatParamsConfig_base: {
    new (...args: any[]): {
        use_alpha_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        alpha_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        use_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        skinning: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        depth_write: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        depth_test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        double_sided: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        front: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
        use_vertex_colors: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        opacity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        alpha_test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        use_fog: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class MeshBasicMatParamsConfig extends MeshBasicMatParamsConfig_base {
}
export declare class MeshBasicMatNode extends TypedMatNode<MeshBasicMaterial, MeshBasicMatParamsConfig> {
    params_config: MeshBasicMatParamsConfig;
    static type(): string;
    create_material(): MeshBasicMaterial;
    readonly texture_map_controller: TextureMapController;
    readonly texture_alpha_map_controller: TextureAlphaMapController;
    readonly depth_controller: DepthController;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
