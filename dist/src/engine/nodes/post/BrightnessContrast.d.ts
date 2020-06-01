import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface BrightnessContrastPassWithUniforms extends ShaderPass {
    uniforms: {
        brightness: IUniformN;
        contrast: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BrightnessContrastPostParamsConfig extends NodeParamsConfig {
    brightness: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    contrast: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class BrightnessContrastPostNode extends TypedPostProcessNode<ShaderPass, BrightnessContrastPostParamsConfig> {
    params_config: BrightnessContrastPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): BrightnessContrastPassWithUniforms;
    update_pass(pass: BrightnessContrastPassWithUniforms): void;
}
export {};
