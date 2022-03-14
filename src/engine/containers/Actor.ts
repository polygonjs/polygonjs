import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';
// import {ActorBuilder} from '../../core/actor/ActorBuilder';

export class ActorContainer extends TypedContainer<NodeContext.ACTOR> {
	override set_content(content: ContainableMap[NodeContext.ACTOR]) {
		super.set_content(content);
	}
	// setActorBuilder(timeline_builder: ActorBuilder) {
	// 	return this.set_content(timeline_builder);
	// }
	// actorBuilder() {
	// 	return this.content();
	// }

	// override coreContentCloned() {
	// 	if (this._content) {
	// 		return this._content.clone();
	// 	}
	// }

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
