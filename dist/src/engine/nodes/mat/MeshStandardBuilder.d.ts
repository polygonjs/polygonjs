import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TextureMapController } from './utils/TextureMapController';
import { TextureAlphaMapController } from './utils/TextureAlphaMapController';
import { TextureEnvMapController } from './utils/TextureEnvMapController';
import { TypedBuilderMatNode } from './_BaseBuilder';
import { ShaderAssemblerStandard } from '../gl/code/assemblers/materials/Standard';
import { AssemblerName } from '../../poly/registers/assemblers/_BaseRegister';
declare const MeshStandardMatParamsConfig_base: {
    new (...args: any[]): {
        use_env_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        env_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        env_map_intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & {
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
declare class MeshStandardMatParamsConfig extends MeshStandardMatParamsConfig_base {
    metalness: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    roughness: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class MeshStandardBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerStandard, MeshStandardMatParamsConfig> {
    params_config: MeshStandardMatParamsConfig;
    static type(): string;
    used_assembler(): Readonly<AssemblerName.GL_MESH_STANDARD>;
    protected _create_assembler_controller(): import("../gl/code/Controller").GlAssemblerController<ShaderAssemblerStandard> | undefined;
    readonly texture_map_controller: TextureMapController;
    readonly texture_alpha_map_controller: TextureAlphaMapController;
    readonly texture_env_map_controller: TextureEnvMapController;
    initialize_node(): void;
    cook(): Promise<void>;
    static _update_metalness(node: MeshStandardBuilderMatNode): void;
    static _update_roughness(node: MeshStandardBuilderMatNode): void;
}
export {};
