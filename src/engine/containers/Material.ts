import {Material} from 'three/src/materials/Material';
import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class MaterialContainer extends TypedContainer<ContainableMap['MATERIAL']> {
	set_content(content: ContainableMap['MATERIAL']) {
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
