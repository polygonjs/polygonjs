/**
 * Update the material metalnessMap
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialMetalnessMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialMetalnessMap';
	}
	_functionName(): 'setMaterialMetalnessMap' {
		return 'setMaterialMetalnessMap';
	}
}
