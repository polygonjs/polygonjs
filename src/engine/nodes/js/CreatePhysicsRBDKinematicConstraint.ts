/**
 * Create an RBD constraint.
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {RefJsDefinition} from './utils/JsDefinition';

enum CreatePhysicsRBDKinematicConstraintJsNodeOutput {
	RBD_ID = 'rbdId',
}

class CreatePhysicsRBDKinematicConstraintJsParamsConfig extends NodeParamsConfig {
	anchor = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CreatePhysicsRBDKinematicConstraintJsParamsConfig();

export class CreatePhysicsRBDKinematicConstraintJsNode extends BaseTriggerAndObjectJsNode<CreatePhysicsRBDKinematicConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'createPhysicsRBDKinematicConstraint';
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint(CreatePhysicsRBDKinematicConstraintJsNodeOutput.RBD_ID, JsConnectionPointType.STRING),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(CreatePhysicsRBDKinematicConstraintJsNodeOutput.RBD_ID)) {
			this._addRBDIdRef(linesController);

			if (!usedOutputNames.includes(JsConnectionPointType.TRIGGER)) {
				this.setTriggeringLines(linesController, '');
			}
		}
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const anchor = this.variableForInputParam(linesController, this.p.anchor);
		this._addRBDIdRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction(
			'createPhysicsRBDKinematicConstraint',
			this,
			linesController
		);

		const bodyLine = func.asString(object3D, anchor);
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	private _addRBDIdRef(linesController: JsLinesCollectionController) {
		const outRBDIds = this.jsVarName(CreatePhysicsRBDKinematicConstraintJsNodeOutput.RBD_ID);
		linesController.addDefinitions(this, [
			// do not use a ref, as it makes the object reactive
			new RefJsDefinition(this, linesController, JsConnectionPointType.STRING, outRBDIds, `''`),
		]);
		return outRBDIds;
	}
}
