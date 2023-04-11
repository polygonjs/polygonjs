/**
 * Pause an audio source
 *
 *
 */
import {Poly} from '../../Poly';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseAudioSourceJsNode} from './_BaseAudioSource';
import {inputObject3D} from './_BaseObject3D';

export class PauseAudioSourceJsNode extends BaseAudioSourceJsNode {
	static override type() {
		return 'pauseAudioSource';
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const node = this.pv.node.node();
		if (!node) {
			return;
		}
		const nodePath = `'${node.path()}'`;

		const func = Poly.namedFunctionsRegister.getFunction('pauseAudioSource', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, nodePath);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
	override setTriggeringLines(
		shadersCollectionController: ShadersCollectionController,
		triggeredMethods: string
	): void {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {gatherable: false});
	}
}
