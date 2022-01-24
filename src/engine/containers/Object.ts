import {Object3D} from 'three/src/core/Object3D';
import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export class ObjectContainer extends TypedContainer<NodeContext.OBJ> {
	override set_content(content: ContainableMap[NodeContext.OBJ]) {
		super.set_content(content);
	}
	set_object(object: Object3D) {
		return this.set_content(object);
	}
	has_object() {
		return this.has_content();
	}
	object() {
		return this.content();
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
