import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface CopyPassWithUniforms extends ShaderPass {
    uniforms: {
        opacity: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CopyPostParamsConfig extends NodeParamsConfig {
    opacity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class CopyPostNode extends TypedPostProcessNode<ShaderPass, CopyPostParamsConfig> {
    params_config: CopyPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): CopyPassWithUniforms;
    update_pass(pass: CopyPassWithUniforms): void;
}
export {};
