import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TextureMapController } from './utils/TextureMapController';
import { TextureAlphaMapController } from './utils/TextureAlphaMapController';
import { ShaderAssemblerBasic } from '../gl/code/assemblers/materials/Basic';
import { TypedBuilderMatNode } from './_BaseBuilder';
import { AssemblerName } from '../../poly/registers/assemblers/_BaseRegister';
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
declare class MeshBasicMatParamsConfig extends MeshBasicMatParamsConfig_base {
}
export declare class MeshBasicBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerBasic, MeshBasicMatParamsConfig> {
    params_config: MeshBasicMatParamsConfig;
    static type(): string;
    used_assembler(): Readonly<AssemblerName.GL_MESH_BASIC>;
    protected _create_assembler_controller(): import("../gl/code/Controller").GlAssemblerController<ShaderAssemblerBasic> | undefined;
    readonly texture_map_controller: TextureMapController;
    readonly texture_alpha_map_controller: TextureAlphaMapController;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
