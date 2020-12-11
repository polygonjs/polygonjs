import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CenterSopParamsConfig extends NodeParamsConfig {
}
export declare class CenterSopNode extends TypedSopNode<CenterSopParamsConfig> {
    params_config: CenterSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};
