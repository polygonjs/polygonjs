/**
 * Update the material color
 *
 *
 */

import {Color, Material, MeshBasicMaterial} from 'three';
import {BaseSetMaterialColorActorNode} from './_BaseSetMaterialColor';

export class SetMaterialColorActorNode extends BaseSetMaterialColorActorNode {
	static override type() {
		return 'setMaterialColor';
	}

	protected _getMaterialColorProperty(material: Material): Color {
		return (material as MeshBasicMaterial).color;
	}
}
