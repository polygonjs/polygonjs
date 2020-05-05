import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN, IUniformV2 } from '../utils/code/gl/Uniforms';
interface PixelPassWithUniforms extends ShaderPass {
    uniforms: {
        resolution: IUniformV2;
        pixelSize: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PixelPostParamsConfig extends NodeParamsConfig {
    pixel_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class PixelPostNode extends TypedPostProcessNode<ShaderPass, PixelPostParamsConfig> {
    params_config: PixelPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): PixelPassWithUniforms;
    update_pass(pass: PixelPassWithUniforms): void;
}
export {};
