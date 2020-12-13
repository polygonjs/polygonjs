import { TypedAnimNode } from './_Base';
import { CopyStamp } from './utils/CopyStamp';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
declare class CopyAnimParamsConfig extends NodeParamsConfig {
    count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class CopyAnimNode extends TypedAnimNode<CopyAnimParamsConfig> {
    params_config: CopyAnimParamsConfig;
    static type(): string;
    private _stamp_node;
    initialize_node(): void;
    cook(input_contents: TimelineBuilder[]): Promise<void>;
    stamp_value(attrib_name?: string): AttribValue;
    get stamp_node(): CopyStamp;
    private create_stamp_node;
}
export {};
