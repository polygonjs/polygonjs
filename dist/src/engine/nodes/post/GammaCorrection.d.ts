import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ShaderPass } from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class GammaCorrectionPostParamsConfig extends NodeParamsConfig {
}
export declare class GammaCorrectionPostNode extends TypedPostProcessNode<ShaderPass, GammaCorrectionPostParamsConfig> {
    params_config: GammaCorrectionPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): ShaderPass;
    update_pass(pass: ShaderPass): void;
}
export {};
