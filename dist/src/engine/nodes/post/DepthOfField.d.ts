import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { BokehPass2 } from '../../../../modules/core/post_process/BokehPass2';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { PerspectiveCameraObjNode } from '../obj/PerspectiveCamera';
declare class DepthOfFieldPostParamsConfig extends NodeParamsConfig {
    focal_depth: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    f_stop: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    max_blur: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    vignetting: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    depth_blur: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    threshold: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    gain: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    bias: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    fringe: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    noise: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    dithering: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    pentagon: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    rings: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    samples: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    clear_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
}
export declare class DepthOfFieldPostNode extends TypedPostProcessNode<BokehPass2, DepthOfFieldPostParamsConfig> {
    params_config: DepthOfFieldPostParamsConfig;
    static type(): string;
    static saturate(x: number): number;
    static linearize(depth: number, near: number, far: number): number;
    static smoothstep(near: number, far: number, depth: number): number;
    protected _create_pass(context: TypedPostNodeContext): BokehPass2 | undefined;
    update_pass_from_camera_node(pass: BokehPass2, camera_node: PerspectiveCameraObjNode): void;
    update_pass(pass: BokehPass2): void;
}
export {};
