import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ClearPass } from '../../../modules/three/examples/jsm/postprocessing/ClearPass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ClearPostParamsConfig extends NodeParamsConfig {
}
export declare class ClearPostNode extends TypedPostProcessNode<ClearPass, ClearPostParamsConfig> {
    params_config: ClearPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): ClearPass;
    update_pass(pass: ClearPass): void;
}
export {};
