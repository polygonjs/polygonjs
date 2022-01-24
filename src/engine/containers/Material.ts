import {Material} from 'three/src/materials/Material';
import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export class MaterialContainer extends TypedContainer<NodeContext.MAT> {
	override set_content(content: ContainableMap[NodeContext.MAT]) {
		super.set_content(content);
	}
	set_material(material: Material) {
		if (this._content != null) {
			this._content.dispose();
		}
		this.set_content(material);
	}
	has_material() {
		return this.has_content();
	}
	material() {
		return this.content();
	}
}
