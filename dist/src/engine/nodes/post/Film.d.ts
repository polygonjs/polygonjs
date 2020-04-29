import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { FilmPass } from '../../../../modules/three/examples/jsm/postprocessing/FilmPass';
import { IUniformN } from '../utils/code/gl/Uniforms';
interface FilmPassWithUniforms extends FilmPass {
    uniforms: {
        time: IUniformN;
        nIntensity: IUniformN;
        sIntensity: IUniformN;
        sCount: IUniformN;
        grayscale: IUniformN;
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class FilmPostParamsConfig extends NodeParamsConfig {
    noise_intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    scanlines_intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    scanlines_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    grayscale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class FilmPostNode extends TypedPostProcessNode<FilmPass, FilmPostParamsConfig> {
    params_config: FilmPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): FilmPassWithUniforms;
    update_pass(pass: FilmPassWithUniforms): void;
}
export {};
