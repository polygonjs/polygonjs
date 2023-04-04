/**
 * return -x
 *
 *
 */

import {Poly} from '../../Poly';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const FUNCTION_NAME = 'negate';

export class NegateJsNode extends MathFunctionArg1OperationFactory('negate', {
	inputPrefix: 'in',
	out: 'out',
}) {
	protected _coreFunction(shadersCollectionController: ShadersCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('');

		return FUNCTION_NAME;
	}
}
