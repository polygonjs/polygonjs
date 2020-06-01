import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { Pass } from '../../../../modules/three/examples/jsm/postprocessing/Pass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SequencePostParamsConfig extends NodeParamsConfig {
}
export declare class SequencePostNode extends TypedPostProcessNode<Pass, SequencePostParamsConfig> {
    params_config: SequencePostParamsConfig;
    static type(): string;
    initialize_node(): void;
    setup_composer(context: TypedPostNodeContext): void;
}
export {};
