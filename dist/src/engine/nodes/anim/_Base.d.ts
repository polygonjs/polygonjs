import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { FlagsControllerB } from '../utils/FlagsController';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
export declare class TypedAnimNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ANIM, K> {
    readonly flags: FlagsControllerB;
    static node_context(): NodeContext;
    static displayed_input_names(): string[];
    initialize_base_node(): void;
    set_timeline_builder(timeline_builder: TimelineBuilder): void;
}
export declare type BaseAnimNodeType = TypedAnimNode<NodeParamsConfig>;
export declare class BaseAnimNodeClass extends TypedAnimNode<NodeParamsConfig> {
}
