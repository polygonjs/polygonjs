import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NullSopParamsConfig extends NodeParamsConfig {
}
export declare class NullSopNode extends TypedSopNode<NullSopParamsConfig> {
    params_config: NullSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};
