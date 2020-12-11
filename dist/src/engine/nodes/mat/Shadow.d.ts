import { ShadowMaterial } from 'three/src/materials/ShadowMaterial';
import { TypedMatNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare const MeshBasicMatParamsConfig_base: {
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
export declare class ShadowMatNode extends TypedMatNode<ShadowMaterial, MeshBasicMatParamsConfig> {
    params_config: MeshBasicMatParamsConfig;
    static type(): string;
    create_material(): ShadowMaterial;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
