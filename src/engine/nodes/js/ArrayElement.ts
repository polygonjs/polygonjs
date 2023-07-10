/**
 * outputs a single element from an array
 *
 *
 *
 */
import {
	JsConnectionPointType,
	JsConnectionPointTypeArray,
	JsConnectionPointTypeFromArrayTypeMap,
} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {RegisterableVariable, createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';
import {BaseArrayElementJsNode, ALLOWED_INPUT_TYPES} from './_BaseArrayToElement';

enum IndexInput {
	index = 'index', // same as param
}

class ArrayElementJsParamsConfig extends NodeParamsConfig {
	index = ParamConfig.INTEGER(0, {
		range: [0, 9],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ArrayElementJsParamsConfig();

export class ArrayElementJsNode extends BaseArrayElementJsNode<ArrayElementJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'arrayElement';
	}

	protected override _expectedInputTypes(): [JsConnectionPointTypeArray, JsConnectionPointType] {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType != null && ALLOWED_INPUT_TYPES.has(firstType as JsConnectionPointTypeArray)
				? (firstType as JsConnectionPointTypeArray)
				: JsConnectionPointType.FLOAT_ARRAY;
		return [type, JsConnectionPointType.INT];
	}
	protected override _expectedInputName(index: number): string {
		const type = this._expectedInputTypes()[0];
		return [`${type}`, IndexInput.index][index];
	}

	protected override _setLinesAsPrimitive(linesController: JsLinesCollectionController) {
		const array = this.variableForInput(linesController, this._expectedInputName(0));
		const index = this.variableForInputParam(linesController, this.p.index);
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const func = Poly.namedFunctionsRegister.getFunction('arrayElementPrimitive', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array, index),
			},
		]);
	}
	protected override _setLinesAsVector(linesController: JsLinesCollectionController) {
		const array = this.variableForInput(linesController, this._expectedInputName(0));
		const index = this.variableForInputParam(linesController, this.p.index);
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const elementType = JsConnectionPointTypeFromArrayTypeMap[dataType];
		const tmpVarName = linesController.addVariable(this, createVariable(elementType) as RegisterableVariable);
		const func = Poly.namedFunctionsRegister.getFunction('arrayElementVector', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array, index, tmpVarName),
			},
		]);
	}
	// private _setLinesAsObject(linesController: JsLinesCollectionController) {
	// 	console.warn('not implemented');
	// }
	// private _setLinesAsIntersection(linesController: JsLinesCollectionController) {
	// 	console.warn('not implemented');
	// }
	// private _setLinesAsTexture(linesController: JsLinesCollectionController) {
	// 	console.warn('not implemented');
	// }
}
