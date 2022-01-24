import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export class EventContainer extends TypedContainer<NodeContext.EVENT> {
	override set_content(content: ContainableMap[NodeContext.EVENT]) {
		super.set_content(content);
	}
}
