/**
 * Update the material map
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialMap';
	}
	_functionName(): 'setMaterialMap' {
		return 'setMaterialMap';
	}
}
