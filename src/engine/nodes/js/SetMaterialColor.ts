/**
 * Update the material color
 *
 *
 */

// import {Color, Material, MeshBasicMaterial} from 'three';
import {BaseSetMaterialColorJsNode} from './_BaseSetMaterialColor';

export class SetMaterialColorJsNode extends BaseSetMaterialColorJsNode {
	static override type() {
		return 'setMaterialColor';
	}
	_functionName(): 'setMaterialColor' {
		return 'setMaterialColor';
	}
}
