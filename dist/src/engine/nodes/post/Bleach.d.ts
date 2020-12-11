import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface BleachPassWithUniforms extends ShaderPass {
    uniforms: {
        opacity: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BleachPostParamsConfig extends NodeParamsConfig {
    opacity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class BleachPostNode extends TypedPostProcessNode<ShaderPass, BleachPostParamsConfig> {
    params_config: BleachPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): BleachPassWithUniforms;
    update_pass(pass: BleachPassWithUniforms): void;
}
export {};
