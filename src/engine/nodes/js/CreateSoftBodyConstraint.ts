/**
 * Creates a soft body constraint
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

enum CreateSoftBodyConstraintOutput {
	ID = 'id',
}

class CreateSoftBodyConstraintJsParamsConfig extends NodeParamsConfig {
	index = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CreateSoftBodyConstraintJsParamsConfig();

export class CreateSoftBodyConstraintJsNode extends BaseTriggerAndObjectJsNode<CreateSoftBodyConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'createSoftBodyConstraint';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(CreateSoftBodyConstraintOutput.ID, JsConnectionPointType.INT),
		]);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const index = this.variableForInputParam(linesController, this.p.index);

		const outConstraintId = this._addConstraintIdRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('softBodyConstraintCreate', this, linesController);

		const bodyLine = func.asString(object3D, index, `this.${outConstraintId}`);
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(CreateSoftBodyConstraintOutput.ID)) {
			this._addConstraintIdRef(linesController);
		}
	}

	private _addConstraintIdRef(linesController: JsLinesCollectionController) {
		const outConstraintId = this.jsVarName(CreateSoftBodyConstraintOutput.ID);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.INT, outConstraintId, `-1`),
		]);
		return outConstraintId;
	}
}
