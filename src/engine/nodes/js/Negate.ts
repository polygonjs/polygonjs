/**
 * return -x
 *
 *
 */

import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg1OperationFactory, PRIMITIVE_ALLOWED_TYPES} from './_Math_Arg1Operation';
import {JsConnectionPointType} from '../utils/io/connections/Js';

const FUNCTION_NAME = 'negate';

export class NegateJsNode extends MathFunctionArg1OperationFactory('negate', {
	inputPrefix: 'value',
	out: 'negate',
	allowed_in_types: [JsConnectionPointType.BOOLEAN, ...PRIMITIVE_ALLOWED_TYPES],
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('');

		return FUNCTION_NAME;
	}
}
