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
		// const bodyLine = `const ${float} = Math.sin(${angle})`;
		// shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addBodyOrComputed(this, JsConnectionPointType.FLOAT, out, `Math.sin(${angle})`);
	}
}
