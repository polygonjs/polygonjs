/**
 * Update the material opacity
 *
 *
 */

import {BaseSetMaterialFloatActorNode} from './_BaseSetMaterialFloat';

export class SetMaterialOpacityActorNode extends BaseSetMaterialFloatActorNode {
	static override type() {
		return 'setMaterialOpacity';
	}

	protected _getMaterialColorPropertyName(): 'opacity' {
		return 'opacity';
	}
}
