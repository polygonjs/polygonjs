import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface VignettePassWithUniforms extends ShaderPass {
    uniforms: {
        offset: IUniformN;
        darkness: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class VignettePostParamsConfig extends NodeParamsConfig {
    offset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    darkness: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class VignettePostNode extends TypedPostProcessNode<ShaderPass, VignettePostParamsConfig> {
    params_config: VignettePostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): VignettePassWithUniforms;
    update_pass(pass: VignettePassWithUniforms): void;
}
export {};
