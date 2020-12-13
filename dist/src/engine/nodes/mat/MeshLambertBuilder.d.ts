import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { DepthController } from './utils/DepthController';
import { TextureMapController } from './utils/TextureMapController';
import { TextureAlphaMapController } from './utils/TextureAlphaMapController';
import { TypedBuilderMatNode } from './_BaseBuilder';
import { ShaderAssemblerLambert } from '../gl/code/assemblers/materials/Lambert';
import { AssemblerName } from '../../poly/registers/assemblers/_BaseRegister';
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
    used_assembler(): Readonly<AssemblerName.GL_MESH_LAMBERT>;
    protected _create_assembler_controller(): import("../gl/code/Controller").GlAssemblerController<ShaderAssemblerLambert> | undefined;
    readonly texture_map_controller: TextureMapController;
    readonly texture_alpha_map_controller: TextureAlphaMapController;
    readonly depth_controller: DepthController;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
