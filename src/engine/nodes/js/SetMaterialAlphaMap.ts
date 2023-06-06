/**
 * Update the material alphaMap
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialAlphaMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialAlphaMap';
	}
	_functionName(): 'setMaterialAlphaMap' {
		return 'setMaterialAlphaMap';
	}
}
