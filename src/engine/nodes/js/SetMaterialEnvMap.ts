/**
 * Update the material envMap
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialEnvMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialEnvMap';
	}
	_functionName(): 'setMaterialEnvMap' {
		return 'setMaterialEnvMap';
	}
}
