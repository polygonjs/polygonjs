import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TextureMapController } from './utils/TextureMapController';
import { TextureAlphaMapController } from './utils/TextureAlphaMapController';
import { TypedBuilderMatNode } from './_BaseBuilder';
import { GlAssemblerController } from '../gl/code/Controller';
import { ShaderAssemblerLambert } from '../gl/code/assemblers/materials/Lambert';
declare const MeshLambertMatParamsConfig_base: {
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
        double_sided: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        front: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        opacity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        alpha_test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        use_fog: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class MeshLambertMatParamsConfig extends MeshLambertMatParamsConfig_base {
}
export declare class MeshLambertBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerLambert, MeshLambertMatParamsConfig> {
    params_config: MeshLambertMatParamsConfig;
    static type(): string;
    readonly texture_map_controller: TextureMapController;
    readonly texture_alpha_map_controller: TextureAlphaMapController;
    initialize_node(): void;
    protected _create_assembler_controller(): GlAssemblerController<ShaderAssemblerLambert>;
    cook(): Promise<void>;
}
export {};
