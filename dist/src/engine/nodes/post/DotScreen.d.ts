import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN, IUniformV2 } from '../utils/code/gl/Uniforms';
interface DotScreenPassWithUniforms extends ShaderPass {
    uniforms: {
        center: IUniformV2;
        angle: IUniformN;
        scale: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class DotScreenPostParamsConfig extends NodeParamsConfig {
    center: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    angle: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class DotScreenPostNode extends TypedPostProcessNode<ShaderPass, DotScreenPostParamsConfig> {
    params_config: DotScreenPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): DotScreenPassWithUniforms;
    update_pass(pass: DotScreenPassWithUniforms): void;
}
export {};
