import {Object3D} from 'three/src/core/Object3D';
import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class ObjectContainer extends TypedContainer<ContainableMap['OBJECT']> {
	set_content(content: ContainableMap['OBJECT']) {
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
	// 		`full path: ${node.full_path()}`,
	// 		`${node.cooks_count()} cooks`,
	// 		`cook time: ${node.cook_time()}`,
	// 		this.content(),
	// 	]
	// }
}
