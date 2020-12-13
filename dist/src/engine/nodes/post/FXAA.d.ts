import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformV2 } from '../utils/code/gl/Uniforms';
interface FXAAPassWithUniforms extends ShaderPass {
    uniforms: {
        resolution: IUniformV2;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class FXAAPostParamsConfig extends NodeParamsConfig {
    transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class FXAAPostNode extends TypedPostProcessNode<ShaderPass, FXAAPostParamsConfig> {
    params_config: FXAAPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): FXAAPassWithUniforms;
    update_pass(pass: FXAAPassWithUniforms): void;
}
export {};
