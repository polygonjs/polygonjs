import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { DepthController } from './utils/DepthController';
import { ShaderAssemblerPoints } from '../gl/code/assemblers/materials/Points';
import { TypedBuilderMatNode } from './_BaseBuilder';
import { AssemblerName } from '../../poly/registers/assemblers/_BaseRegister';
declare const PointsMatParamsConfig_base: {
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
declare class PointsMatParamsConfig extends PointsMatParamsConfig_base {
}
export declare class PointsBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerPoints, PointsMatParamsConfig> {
    params_config: PointsMatParamsConfig;
    static type(): string;
    used_assembler(): Readonly<AssemblerName.GL_POINTS>;
    protected _create_assembler_controller(): import("../gl/code/Controller").GlAssemblerController<ShaderAssemblerPoints> | undefined;
    readonly depth_controller: DepthController;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
