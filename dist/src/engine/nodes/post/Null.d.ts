import { TypedPostProcessNode } from './_Base';
import { Pass } from '../../../../modules/three/examples/jsm/postprocessing/Pass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NullPostParamsConfig extends NodeParamsConfig {
}
export declare class NullPostNode extends TypedPostProcessNode<Pass, NullPostParamsConfig> {
    params_config: NullPostParamsConfig;
    static type(): string;
}
export {};
