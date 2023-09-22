/**
 * clamps the input value between a min and a max
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MathFunctionArg5OperationFactory, DEFAULT_ALLOWED_TYPES} from './_Math_Arg1Operation';

enum FitInput {
	VALUE = 'val',
	SRC_MIN = 'srcMin',
	SRC_MAX = 'srcMax',
	DEST_MIN = 'destMin',
	DEST_MAX = 'destMax',
	CLAMP_TO_DEST_RANGE = 'clampToDestRange',
}
const DefaultValues: PolyDictionary<number> = {
	[FitInput.VALUE]: 0,
	[FitInput.SRC_MIN]: 0,
	[FitInput.SRC_MAX]: 1,
	[FitInput.DEST_MIN]: 0,
	[FitInput.DEST_MAX]: 1,
	[FitInput.CLAMP_TO_DEST_RANGE]: 0,
};

const FUNCTION_NAME_FIT = 'fit';
const FUNCTION_NAME_FIT_CLAMP = 'fitClamp';
const FUNCTION_NAMES: ['fit', 'fitClamp'] = [FUNCTION_NAME_FIT, FUNCTION_NAME_FIT_CLAMP];
export class FitJsNode extends MathFunctionArg5OperationFactory('fit', {
	inputPrefix: 'in',
	out: 'val',
}) {
	protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
		FUNCTION_NAMES.forEach((functionName) => {
			Poly.namedFunctionsRegister
				.getFunction(functionName, this, shadersCollectionController)
				.asString('', '', '', '', '');
		});
		const doClamp = this.variableForInput(shadersCollectionController, FitInput.CLAMP_TO_DEST_RANGE);
		return `${doClamp} ? ${FUNCTION_NAME_FIT_CLAMP}: ${FUNCTION_NAME_FIT}`;
	}
	protected _inputValuesCount() {
		const inputTypes = this._expectedInputTypes();
		const inputValuesCount = inputTypes.length;
		// we use -1 here, as we don't want the clamp input to be part of the args list
		return inputValuesCount - 1;
	}

	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [
			FitInput.VALUE,
			FitInput.SRC_MIN,
			FitInput.SRC_MAX,
			FitInput.DEST_MIN,
			FitInput.DEST_MAX,
			FitInput.CLAMP_TO_DEST_RANGE,
		][index];
	}

	protected override _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		const connectionPoints =  this.io.inputs.namedInputConnectionPoints()
		if (first_input_type && connectionPoints) {
			if (!DEFAULT_ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = connectionPoints[0];
				if (first_connection) {
					first_input_type = first_connection.type();
				}
			}
		}
		const type = first_input_type || JsConnectionPointType.FLOAT;
		const boundType = JsConnectionPointTypeFromArrayTypeMap[type];
		return [type, boundType, boundType, boundType, boundType, JsConnectionPointType.BOOLEAN];
	}
}
