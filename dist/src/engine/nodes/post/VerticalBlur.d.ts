import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface VerticalBlurPassWithUniforms extends ShaderPass {
    uniforms: {
        v: IUniformN;
    };
    resolution_y: number;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class VerticalBlurPostParamsConfig extends NodeParamsConfig {
    amount: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class VerticalBlurPostNode extends TypedPostProcessNode<ShaderPass, VerticalBlurPostParamsConfig> {
    params_config: VerticalBlurPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): VerticalBlurPassWithUniforms;
    update_pass(pass: VerticalBlurPassWithUniforms): void;
}
export {};
