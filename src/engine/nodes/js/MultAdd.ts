/**
 * return (x + preAdd) x mult + postAdd
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg4OperationFactory, DEFAULT_ALLOWED_TYPES} from './_Math_Arg1Operation';

export enum MultAddInput {
	VALUE = 'value',
	PRE_ADD = 'preAdd',
	MULT = 'mult',
	POST_ADD = 'postAdd',
}
const DefaultValues: PolyDictionary<number> = {
	[MultAddInput.VALUE]: 0,
	[MultAddInput.PRE_ADD]: 0,
	[MultAddInput.MULT]: 1,
	[MultAddInput.POST_ADD]: 0,
};

const FUNCTION_NAME = 'multAdd';
export class MultAddJsNode extends MathFunctionArg4OperationFactory('multAdd', {
	inputPrefix: 'in',
	out: 'val',
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		Poly.namedFunctionsRegister
			.getFunction(FUNCTION_NAME, this, shadersCollectionController)
			.asString('', '', '', '');
		return FUNCTION_NAME;
	}

	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [MultAddInput.VALUE, MultAddInput.PRE_ADD, MultAddInput.MULT, MultAddInput.POST_ADD][index];
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
		return [type, boundType, boundType, boundType];
	}
}
