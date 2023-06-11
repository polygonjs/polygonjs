/**
 * Update the material displacementMap
 *
 *
 */

import {BaseSetMaterialTextureJsNode} from './_BaseSetMaterialTexture';

export class SetMaterialDisplacementMapJsNode extends BaseSetMaterialTextureJsNode {
	static override type() {
		return 'setMaterialDisplacementMap';
	}
	_functionName(): 'setMaterialDisplacementMap' {
		return 'setMaterialDisplacementMap';
	}
}
