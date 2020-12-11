import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface HorizontalBlurPassWithUniforms extends ShaderPass {
    uniforms: {
        h: IUniformN;
    };
    resolution_x: number;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class HorizontalBlurPostParamsConfig extends NodeParamsConfig {
    amount: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class HorizontalBlurPostNode extends TypedPostProcessNode<ShaderPass, HorizontalBlurPostParamsConfig> {
    params_config: HorizontalBlurPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): HorizontalBlurPassWithUniforms;
    update_pass(pass: HorizontalBlurPassWithUniforms): void;
}
export {};
