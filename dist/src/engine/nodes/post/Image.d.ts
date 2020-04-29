import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { IUniformN, IUniformTexture } from '../utils/code/gl/Uniforms';
interface ShaderPassWithRequiredUniforms extends ShaderPass {
    uniforms: {
        map: IUniformTexture;
        darkness: IUniformN;
        offset: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ImagePostParamsConfig extends NodeParamsConfig {
    map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    darkness: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    offset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class ImagePostNode extends TypedPostProcessNode<ShaderPass, ImagePostParamsConfig> {
    params_config: ImagePostParamsConfig;
    static type(): string;
    static _create_shader(): {
        uniforms: {
            tDiffuse: IUniformTexture;
            map: IUniformTexture;
            offset: {
                value: number;
            };
            darkness: {
                value: number;
            };
        };
        vertexShader: string;
        fragmentShader: string;
    };
    protected _create_pass(context: TypedPostNodeContext): ShaderPassWithRequiredUniforms;
    update_pass(pass: ShaderPassWithRequiredUniforms): void;
    private _update_map;
}
export {};
