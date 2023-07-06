import {Material} from 'three';
import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';
import {CoreMaterial} from '../../core/geometry/Material';

export class MaterialContainer extends TypedContainer<NodeContext.MAT> {
	override set_content(content: ContainableMap[NodeContext.MAT]) {
		super.set_content(content);
	}
	override coreContentCloned(): ContainableMap[NodeContext.MAT] | undefined {
		if (this._content) {
			const cloned = CoreMaterial.clone(this._node.scene(), this._content, {
				shareCustomUniforms: true,
				addCustomMaterials: true,
			}); //.clone();
			// const cloned = this._content.clone();
			return cloned;
		}
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
