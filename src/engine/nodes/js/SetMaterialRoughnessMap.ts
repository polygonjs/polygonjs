/**
 * Update the material roughnessMap
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialRoughnessMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialRoughnessMap';
	}
	_functionName(): 'setMaterialRoughnessMap' {
		return 'setMaterialRoughnessMap';
	}
}
