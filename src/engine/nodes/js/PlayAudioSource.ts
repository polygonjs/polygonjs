/**
 * Play an audio source
 *
 *
 */

import {Poly} from '../../Poly';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseAudioSourceJsNode} from './_BaseAudioSource';
import {inputObject3D} from './_BaseObject3D';
export class PlayAudioSourceJsNode extends BaseAudioSourceJsNode {
	static override type() {
		return 'playAudioSource';
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const node = this.pv.node.node();
		if (!node) {
			return;
		}
		const nodePath = `'${node.path()}'`;

		const func = Poly.namedFunctionsRegister.getFunction('playAudioSource', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, nodePath);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
