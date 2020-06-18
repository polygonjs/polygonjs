import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { AdaptiveToneMappingPass } from '../../../../modules/three/examples/jsm/postprocessing/AdaptiveToneMappingPass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AdaptiveToneMappingPostParamsConfig extends NodeParamsConfig {
    adaptative: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    average_luminance: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    mid_grey: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    max_luminance: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    adaption_rage: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class AdaptiveToneMappingPostNode extends TypedPostProcessNode<AdaptiveToneMappingPass, AdaptiveToneMappingPostParamsConfig> {
    params_config: AdaptiveToneMappingPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): AdaptiveToneMappingPass;
    update_pass(pass: AdaptiveToneMappingPass): void;
}
export {};
