/**
 * returns mod(a,b)
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg2OperationFactory} from './_Math_Arg1Operation';

enum ModInput {
	value0 = 'value0',
	value1 = 'value1',
}
const DefaultValues: PolyDictionary<number> = {
	[ModInput.value0]: 0,
	[ModInput.value1]: 1,
};

const FUNCTION_NAME = 'mod';
export class ModJsNode extends MathFunctionArg2OperationFactory('mod', {
	inputPrefix: 'in',
	out: 'mod',
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('', '');

		return FUNCTION_NAME;
	}

	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [ModInput.value0, ModInput.value1][index];
	}

	protected override _expectedInputTypes() {
		return [JsConnectionPointType.FLOAT, JsConnectionPointType.FLOAT];
	}
}
