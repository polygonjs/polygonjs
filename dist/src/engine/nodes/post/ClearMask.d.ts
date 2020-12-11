import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { ClearMaskPass } from '../../../modules/three/examples/jsm/postprocessing/MaskPass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ClearMaskPostParamsConfig extends NodeParamsConfig {
}
export declare class ClearMaskPostNode extends TypedPostProcessNode<ClearMaskPass, ClearMaskPostParamsConfig> {
    params_config: ClearMaskPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): ClearMaskPass;
    update_pass(pass: ClearMaskPass): void;
}
export {};
