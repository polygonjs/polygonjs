import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformV3 } from '../utils/code/gl/Uniforms';
interface ColorCorrectionPassWithUniforms extends ShaderPass {
    uniforms: {
        powRGB: IUniformV3;
        mulRGB: IUniformV3;
        addRGB: IUniformV3;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ColorCorrectionPostParamsConfig extends NodeParamsConfig {
    pow: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    mult: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    add: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
}
export declare class ColorCorrectionPostNode extends TypedPostProcessNode<ShaderPass, ColorCorrectionPostParamsConfig> {
    params_config: ColorCorrectionPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): ColorCorrectionPassWithUniforms;
    update_pass(pass: ColorCorrectionPassWithUniforms): void;
}
export {};
