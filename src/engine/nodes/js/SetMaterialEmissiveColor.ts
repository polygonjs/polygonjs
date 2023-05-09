/**
 * Update the material emissive color
 *
 *
 */

import {BaseSetMaterialColorJsNode} from './_BaseSetMaterialColor';

export class SetMaterialEmissiveColorJsNode extends BaseSetMaterialColorJsNode {
	static override type() {
		return 'setMaterialEmissiveColor';
	}

	_functionName(): 'setMaterialEmissiveColor' {
		return 'setMaterialEmissiveColor';
	}
}
