import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface SepiaPassWithUniforms extends ShaderPass {
    uniforms: {
        amount: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SepiaPostParamsConfig extends NodeParamsConfig {
    amount: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class SepiaPostNode extends TypedPostProcessNode<ShaderPass, SepiaPostParamsConfig> {
    params_config: SepiaPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): SepiaPassWithUniforms;
    update_pass(pass: SepiaPassWithUniforms): void;
}
export {};
