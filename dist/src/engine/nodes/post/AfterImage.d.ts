import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { AfterimagePass } from '../../../modules/three/examples/jsm/postprocessing/AfterimagePass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface AfterImagePassWithUniforms extends AfterimagePass {
    uniforms: {
        damp: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AfterImagePostParamsConfig extends NodeParamsConfig {
    damp: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class AfterImagePostNode extends TypedPostProcessNode<AfterImagePassWithUniforms, AfterImagePostParamsConfig> {
    params_config: AfterImagePostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): AfterImagePassWithUniforms;
    update_pass(pass: AfterImagePassWithUniforms): void;
}
export {};
