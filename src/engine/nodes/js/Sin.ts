/**
 * returns the math function sin(x)
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SinJsNode extends MathFunctionArg1OperationFactory('sin', {
	inputPrefix: 'angle',
	out: 'sin',
}) {
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const angle = this.variableForInput(shadersCollectionController, this._expectedInputName(0));

		const out = this.jsVarName(this._expectedOutputName(0));

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.FLOAT, varName: out, value: `Math.sin(${angle})`},
		]);
	}
}
