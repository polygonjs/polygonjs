import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { UnrealBloomPass } from '../../../../modules/three/examples/jsm/postprocessing/UnrealBloomPass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class UnrealBloomPostParamsConfig extends NodeParamsConfig {
    strength: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    threshold: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class UnrealBloomPostNode extends TypedPostProcessNode<UnrealBloomPass, UnrealBloomPostParamsConfig> {
    params_config: UnrealBloomPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): UnrealBloomPass;
    update_pass(pass: UnrealBloomPass): void;
}
export {};
