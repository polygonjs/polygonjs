/**
 * return -x
 *
 *
 */

import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {LocalFunctionJsDefinition} from './utils/JsDefinition';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const NEGATE_FUNCTION_NAME = 'negate';
const NEGATE_FUNCTION_BODY = `function ${NEGATE_FUNCTION_NAME}(src){
	return -src;
}`;

export class NegateJsNode extends MathFunctionArg1OperationFactory('negate', {
	inputPrefix: 'in',
	out: 'out',
	functionPrefix: 'negate',
}) {
	protected _mathFunctionDeclaration(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addDefinitions(this, [
			new LocalFunctionJsDefinition(
				this,
				shadersCollectionController,
				this._expectedInputTypes()[0],
				NEGATE_FUNCTION_NAME,
				NEGATE_FUNCTION_BODY
			),
		]);

		return NEGATE_FUNCTION_NAME;
	}
}
