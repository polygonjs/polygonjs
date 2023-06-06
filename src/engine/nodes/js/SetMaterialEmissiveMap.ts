/**
 * Update the material emissiveMap
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialEmissiveMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialEmissiveMap';
	}
	_functionName(): 'setMaterialEmissiveMap' {
		return 'setMaterialEmissiveMap';
	}
}
