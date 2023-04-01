/**
 * Update the material opacity
 *
 *
 */

import {BaseSetMaterialFloatJsNode} from './_BaseSetMaterialFloat';

export class SetMaterialOpacityJsNode extends BaseSetMaterialFloatJsNode {
	static override type() {
		return 'setMaterialOpacity';
	}

	_functionName(): 'setMaterialOpacity' {
		return 'setMaterialOpacity';
	}
}
