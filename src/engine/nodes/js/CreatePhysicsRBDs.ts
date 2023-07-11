/**
 * Add children objects to the input object
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {RefJsDefinition} from './utils/JsDefinition';

enum CreatePhysicsRBDsJsNodeInput {
	OBJECT_3D = 'rbdObject',
	OBJECT_3DS = 'rbdObjects',
}
enum CreatePhysicsRBDsJsNodeOutput {
	RBD_ID = 'RBDId',
	RBD_IDS = 'RBDIds',
}

class CreatePhysicsRBDsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CreatePhysicsRBDsJsParamsConfig();

export class CreatePhysicsRBDsJsNode extends BaseTriggerAndObjectJsNode<CreatePhysicsRBDsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'createPhysicsRBDs';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	private _expectedInputName(index: number) {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D, this._childInputName()][index];
	}
	private _expectedOutputName(index: number) {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D, this._childOutputName()][index];
	}
	private _expectedInputTypes() {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D, this._childInputType()];
	}
	private _expectedOutputTypes() {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D, this._childOutputType()];
	}
	private _isInputArray() {
		const firstInputType = this.io.connection_points.input_connection_type(2);
		return firstInputType == JsConnectionPointType.OBJECT_3D_ARRAY;
	}
	private _childInputName() {
		return this._isInputArray() ? CreatePhysicsRBDsJsNodeInput.OBJECT_3DS : CreatePhysicsRBDsJsNodeInput.OBJECT_3D;
	}
	private _childOutputName() {
		return this._isInputArray() ? CreatePhysicsRBDsJsNodeOutput.RBD_IDS : CreatePhysicsRBDsJsNodeOutput.RBD_ID;
	}
	private _childInputType() {
		return this._isInputArray() ? JsConnectionPointType.OBJECT_3D_ARRAY : JsConnectionPointType.OBJECT_3D;
	}
	private _childOutputType() {
		return this._isInputArray() ? JsConnectionPointType.STRING_ARRAY : JsConnectionPointType.STRING;
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		const outRBDIds = this._addRBDIdRef(linesController);
		const out = this.jsVarName(this._childOutputName());

		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.OBJECT_3D, varName: out, value: `this.${outRBDIds}.value`},
		]);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const inputName = this._childInputName();
		const inputObjects = this.variableForInput(linesController, inputName);
		const functionName = this._isInputArray() ? 'createPhysicsRBDs' : 'createPhysicsRBD';
		const outRBDIds = this._addRBDIdRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);

		const bodyLine = func.asString(object3D, inputObjects, `this.${outRBDIds}`);
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	private _addRBDIdRef(linesController: JsLinesCollectionController) {
		// const outputName = this._childOutputName();
		const outRBDIds = this.jsVarName('rbdIds');
		linesController.addDefinitions(this, [
			// do not use a ref, as it makes the object reactive
			new RefJsDefinition(this, linesController, JsConnectionPointType.STRING, outRBDIds, `''`),
		]);
		return outRBDIds;
	}
}
