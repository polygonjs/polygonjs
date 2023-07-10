/**
 * gets and remove the last element of an array
 *
 *
 *
 */
import {
	JsConnectionPointTypeFromArrayTypeMap,
} from '../utils/io/connections/Js';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {RegisterableVariable, createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';
import { BaseArrayElementJsNode } from './_BaseArrayToElement';


class ArrayPopJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ArrayPopJsParamsConfig();

export class ArrayPopJsNode extends BaseArrayElementJsNode<ArrayPopJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'arrayPop';
	}
	
	protected override _setLinesAsPrimitive(linesController: JsLinesCollectionController) {
		const array = this.variableForInput(linesController, this._expectedInputName(0));
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const func = Poly.namedFunctionsRegister.getFunction('arrayPopPrimitive', this, linesController);
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
		const func = Poly.namedFunctionsRegister.getFunction('arrayPopVector', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array, tmpVarName),
			},
		]);
	}
}
