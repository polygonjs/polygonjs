/**
 * Update the material emissive color
 *
 *
 */

import {Material, MeshLambertMaterial} from 'three';
import {BaseSetMaterialColorActorNode} from './_BaseSetMaterialColor';

export class SetMaterialEmissiveColorActorNode extends BaseSetMaterialColorActorNode {
	static override type() {
		return 'setMaterialEmissiveColor';
	}

	protected _getMaterialColorProperty(material: Material) {
		return (material as MeshLambertMaterial).emissive;
	}
}
