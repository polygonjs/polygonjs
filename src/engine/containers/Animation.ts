import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {TimelineBuilder} from '../../core/animation/TimelineBuilder';
import {NodeContext} from '../poly/NodeContext';

export class AnimationContainer extends TypedContainer<NodeContext.ANIM> {
	override set_content(content: ContainableMap[NodeContext.ANIM]) {
		super.set_content(content);
	}
	setTimelineBuilder(timeline_builder: TimelineBuilder) {
		return this.set_content(timeline_builder);
	}
	timelineBuilder() {
		return this.content();
	}

	override coreContentCloned() {
		if (this._content) {
			return this._content.clone();
		}
	}

	// infos() {
	// 	const node = this.node()
	// 	return [
	// 		`full path: ${node.path()}`,
	// 		`${node.cooks_count()} cooks`,
	// 		`cook time: ${node.cook_time()}`,
	// 		this.content(),
	// 	]
	// }
}
