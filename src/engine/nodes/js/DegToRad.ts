/**
 * converts degrees to radians
 *
 *
 */

import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const FUNCTION_NAME = 'degToRad';

export class DegToRadJsNode extends MathFunctionArg1OperationFactory('degToRad', {
	inputPrefix: 'in',
	out: 'out',
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('');

		return FUNCTION_NAME;
	}
}
