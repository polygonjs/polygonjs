import {Material} from 'three/src/materials/Material';
import {TypedContainer} from './_Base';

export class MaterialContainer extends TypedContainer<Material> {
	// constructor() {
	// 	super();
	// }

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
