import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { TimelineBuilder } from '../../core/animation/TimelineBuilder';
import { NodeContext } from '../poly/NodeContext';
export declare class AnimationContainer extends TypedContainer<NodeContext.ANIM> {
    set_content(content: ContainableMap[NodeContext.ANIM]): void;
    set_timeline_builder(timeline_builder: TimelineBuilder): void;
    timeline_builder(): TimelineBuilder;
    core_content_cloned(): TimelineBuilder | undefined;
}
