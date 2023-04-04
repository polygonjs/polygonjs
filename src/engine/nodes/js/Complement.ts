/**
 * return 1-x
 *
 *
 */

import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {LocalFunctionJsDefinition} from './utils/JsDefinition';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const COMPLEMENT_FUNCTION_NAME = 'complement';
const COMPLEMENT_FUNCTION_BODY = `function ${COMPLEMENT_FUNCTION_NAME}(src){
	return 1-src;
}`;

export class ComplementJsNode extends MathFunctionArg1OperationFactory('complement', {
	inputPrefix: 'in',
	out: 'out',
	functionPrefix: 'complement',
}) {
	protected _mathFunctionDeclaration(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addDefinitions(this, [
			new LocalFunctionJsDefinition(
				this,
				shadersCollectionController,
				this._expectedInputTypes()[0],
				COMPLEMENT_FUNCTION_NAME,
				COMPLEMENT_FUNCTION_BODY
			),
		]);

		return COMPLEMENT_FUNCTION_NAME;
	}
}
