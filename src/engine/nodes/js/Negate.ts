/**
 * return -x
 *
 *
 */

import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const FUNCTION_NAME = 'negate';

export class NegateJsNode extends MathFunctionArg1OperationFactory('negate', {
	inputPrefix: 'value',
	out: 'negate',
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('');

		return FUNCTION_NAME;
	}
}
