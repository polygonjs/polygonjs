/**
 * returns a deterministic rand
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg2OperationFactory} from './_Math_Arg1Operation';

enum RandInput {
	value0 = 'value0',
	value1 = 'value1',
}
const DefaultValues: PolyDictionary<number> = {
	[RandInput.value0]: 0,
	[RandInput.value1]: 0,
};

const FUNCTION_NAME = 'rand';
export class RandJsNode extends MathFunctionArg2OperationFactory('rand', {
	inputPrefix: 'in',
	out: 'rand',
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('', '');

		return FUNCTION_NAME;
	}

	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [RandInput.value0, RandInput.value1][index];
	}

	protected override _expectedInputTypes() {
		return [JsConnectionPointType.FLOAT, JsConnectionPointType.FLOAT];
	}
}
