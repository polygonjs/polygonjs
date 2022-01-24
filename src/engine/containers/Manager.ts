import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export class ManagerContainer extends TypedContainer<NodeContext.MANAGER> {
	override set_content(content: ContainableMap[NodeContext.MANAGER]) {
		super.set_content(content);
	}
}
