import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { RenderPass } from '../../../../modules/three/examples/jsm/postprocessing/RenderPass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class RenderPostParamsConfig extends NodeParamsConfig {
    override_scene: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    scene: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    override_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class RenderPostNode extends TypedPostProcessNode<RenderPass, RenderPostParamsConfig> {
    params_config: RenderPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): RenderPass;
}
export {};
