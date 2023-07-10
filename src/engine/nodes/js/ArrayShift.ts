/**
 * gets and remove the first element of an array
 *
 *
 *
 */
import {JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {RegisterableVariable, createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';
import {BaseArrayElementJsNode} from './_BaseArrayToElement';

class ArrayShiftJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ArrayShiftJsParamsConfig();

export class ArrayShiftJsNode extends BaseArrayElementJsNode<ArrayShiftJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'arrayShift';
	}

	protected override _setLinesAsPrimitive(linesController: JsLinesCollectionController) {
		const array = this.variableForInput(linesController, this._expectedInputName(0));
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const func = Poly.namedFunctionsRegister.getFunction('arrayShiftPrimitive', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array),
			},
		]);
	}
	protected override _setLinesAsVector(linesController: JsLinesCollectionController) {
		const array = this.variableForInput(linesController, this._expectedInputName(0));
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const elementType = JsConnectionPointTypeFromArrayTypeMap[dataType];
		const tmpVarName = linesController.addVariable(this, createVariable(elementType) as RegisterableVariable);
		const func = Poly.namedFunctionsRegister.getFunction('arrayShiftVector', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array, tmpVarName),
			},
		]);
	}
}
