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

export enum CreateObjectsJsNodeInput {
	CHILD = 'child',
	CHILDREN = 'children',
}

class CreateObjectsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CreateObjectsJsParamsConfig();

export class CreateObjectsJsNode extends BaseTriggerAndObjectJsNode<CreateObjectsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'createObjects';
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
		return this._expectedInputTypes();
	}
	private _isInputArray() {
		const firstInputType = this.io.connection_points.input_connection_type(2);
		return firstInputType == JsConnectionPointType.OBJECT_3D_ARRAY;
	}
	private _childInputName() {
		return this._isInputArray() ? CreateObjectsJsNodeInput.CHILDREN : CreateObjectsJsNodeInput.CHILD;
	}
	private _childOutputName() {
		return this._childInputName();
	}
	private _childInputType() {
		return this._isInputArray() ? JsConnectionPointType.OBJECT_3D_ARRAY : JsConnectionPointType.OBJECT_3D;
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		const object3D = this.variableForInput(linesController, this._childOutputName());
		const out = this.jsVarName(this._childOutputName());

		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.OBJECT_3D, varName: out, value: object3D},
		]);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const inputName = this._childInputName();
		const inputChildObjects = this.variableForInput(linesController, inputName);
		const functionName = this._isInputArray() ? 'createObjects' : 'createObject';

		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);

		const bodyLine = func.asString(object3D, inputChildObjects);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
