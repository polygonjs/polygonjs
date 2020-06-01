import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface RGBShiftPassWithUniforms extends ShaderPass {
    uniforms: {
        amount: IUniformN;
        angle: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class RGBShiftPostParamsConfig extends NodeParamsConfig {
    amount: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    angle: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class RGBShiftPostNode extends TypedPostProcessNode<ShaderPass, RGBShiftPostParamsConfig> {
    params_config: RGBShiftPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): RGBShiftPassWithUniforms;
    update_pass(pass: RGBShiftPassWithUniforms): void;
}
export {};
