import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformV2, IUniformN } from '../utils/code/gl/Uniforms';
import { Vector2 } from 'three/src/math/Vector2';
interface TriangleBlurPassWithUniforms extends ShaderPass {
    uniforms: {
        delta: IUniformV2;
        h: IUniformN;
    };
    resolution: Vector2;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TriangleBlurPostParamsConfig extends NodeParamsConfig {
    delta: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
}
export declare class TriangleBlurPostNode extends TypedPostProcessNode<ShaderPass, TriangleBlurPostParamsConfig> {
    params_config: TriangleBlurPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): TriangleBlurPassWithUniforms;
    update_pass(pass: TriangleBlurPassWithUniforms): void;
}
export {};
