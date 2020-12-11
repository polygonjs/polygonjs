import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { TypedMatNode } from './_Base';
import { DepthController } from './utils/DepthController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare const LineBasicMatParamsConfig_base: {
    new (...args: any[]): {
        depth_write: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        depth_test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class LineBasicMatParamsConfig extends LineBasicMatParamsConfig_base {
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    line_width: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class LineBasicMatNode extends TypedMatNode<LineBasicMaterial, LineBasicMatParamsConfig> {
    params_config: LineBasicMatParamsConfig;
    static type(): string;
    create_material(): LineBasicMaterial;
    readonly depth_controller: DepthController;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
