/**
 * Play an audio source
 *
 *
 */

import {Poly} from '../../Poly';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {nodeMethodName, triggerableMethodCalls} from './code/assemblers/actor/ActorAssemblerUtils';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {InitFunctionJsDefinition, TriggerableJsDefinition} from './utils/JsDefinition';
import {BaseAudioSourceJsNode} from './_BaseAudioSource';
import {inputObject3D} from './_BaseObject3D';
export class PlayAudioSourceJsNode extends BaseAudioSourceJsNode {
	static override type() {
		return 'playAudioSource';
	}
	private _targetNodePath() {
		const node = this.pv.node.node();
		if (!node) {
			return;
		}
		const nodePath = `'${node.path()}'`;
		return nodePath;
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const nodePath = this._targetNodePath();
		if (!nodePath) {
			return;
		}
		const _addPlay = () => {
			const object3D = inputObject3D(this, shadersCollectionController);

			const func = Poly.namedFunctionsRegister.getFunction('playAudioSource', this, shadersCollectionController);
			const bodyLine = func.asString(object3D, nodePath);
			shadersCollectionController.addTriggerableLines(this, [bodyLine], {addTriggeredLines: false});
		};

		const _addOnStop = () => {
			const usedOutputNames = this.io.outputs.used_output_names();
			if (!usedOutputNames.includes(JsConnectionPointType.TRIGGER)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(
				'addAudioStopEventListener',
				this,
				shadersCollectionController
			);
			const onStopMethodName = nodeMethodName(this, 'onStop');
			const bodyLine = func.asString(nodePath, `this.${onStopMethodName}.bind(this)`, `this`);
			shadersCollectionController.addDefinitions(this, [
				new InitFunctionJsDefinition(
					this,
					shadersCollectionController,
					JsConnectionPointType.OBJECT_3D,
					this.path(),
					bodyLine
				),
			]);

			const triggerableLines = triggerableMethodCalls(this);

			const value = triggerableLines;
			const varName = onStopMethodName;
			const dataType = JsConnectionPointType.BOOLEAN; // unused
			shadersCollectionController.addDefinitions(this, [
				new TriggerableJsDefinition(this, shadersCollectionController, dataType, varName, value, {
					methodName: onStopMethodName,
				}),
			]);
		};
		_addPlay();
		_addOnStop();
	}
}
