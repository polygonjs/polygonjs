import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class NullSopParamsConfig extends NodeParamsConfig {
}
export declare class NullSopNode extends TypedSopNode<NullSopParamsConfig> {
    params_config: NullSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
}
export {};
