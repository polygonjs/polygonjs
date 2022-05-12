/**
 * Update the material color
 *
 *
 */

import {Material, MeshBasicMaterial} from 'three';
import {BaseSetMaterialColorActorNode} from './_BaseSetMaterialColor';

export class SetMaterialColorActorNode extends BaseSetMaterialColorActorNode {
	static override type() {
		return 'setMaterialColor';
	}

	protected _getMaterialColorProperty(material: Material) {
		return (material as MeshBasicMaterial).color;
	}
}
