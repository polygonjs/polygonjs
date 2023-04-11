/**
 * returns a blend between 2 inputs
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {MathVectorFunction3vvf, _vectorFunctionName_3vvf} from '../../functions/_MathGeneric';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {MathFunctionArg3OperationFactory, DEFAULT_ALLOWED_TYPES, MathFunctionData} from './_Math_Arg1Operation';

enum MixInput {
	value0 = 'value0',
	value1 = 'value1',
	blend = 'blend',
}
const DefaultValues: PolyDictionary<number> = {
	[MixInput.value0]: 0,
	[MixInput.value1]: 1,
	[MixInput.blend]: 0.5,
};

const FUNCTION_NAME = 'mix';
export class MixJsNode extends MathFunctionArg3OperationFactory('mix', {
	inputPrefix: 'in',
	out: 'mix',
}) {
	protected _coreFunction(shadersCollectionController: ShadersCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('', '', '');

		return FUNCTION_NAME;
	}
	protected _functionData(): MathFunctionData<MathVectorFunction3vvf> {
		return {
			vectorFunctionNameFunction: _vectorFunctionName_3vvf,
			mathFloat: 'mathFloat_3',
			mathPrimArray: 'mathPrimArray_3',
			mathVectorArray: 'mathVectorArray_3',
		};
	}

	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [MixInput.value0, MixInput.value1, MixInput.blend][index];
	}

	protected override _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		if (first_input_type) {
			if (!DEFAULT_ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = this.io.inputs.namedInputConnectionPoints()[0];
				if (first_connection) {
					first_input_type = first_connection.type();
				}
			}
		}
		const type = first_input_type || JsConnectionPointType.FLOAT;
		const boundType = JsConnectionPointTypeFromArrayTypeMap[type];
		return [type, boundType, JsConnectionPointType.FLOAT];
	}
}
