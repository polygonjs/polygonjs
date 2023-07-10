import {
	JsConnectionPointType,
	ARRAY_JS_CONNECTION_TYPES_SET,
	JsConnectionPointTypeFromArrayTypeMap,
	JsConnectionPointTypeArray,
} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {TypeAssert} from '../../poly/Assert';

export const ALLOWED_INPUT_TYPES = ARRAY_JS_CONNECTION_TYPES_SET;

export class BaseArrayElementJsNode<T extends NodeParamsConfig> extends TypedJsNode<T> {
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes(): JsConnectionPointType[] {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType != null && ALLOWED_INPUT_TYPES.has(firstType as JsConnectionPointTypeArray)
				? (firstType as JsConnectionPointTypeArray)
				: JsConnectionPointType.FLOAT_ARRAY;
		return [type];
	}

	protected _expectedInputName(index: number): string {
		const type = this._expectedInputTypes()[0];
		return [`${type}`][index];
	}
	protected _expectedOutputName(index: number): string {
		const type = this._expectedOutputTypes()[0];
		return `${type}`;
	}
	protected _expectedOutputTypes() {
		const firstType = this._expectedInputTypes()[0];
		const outputType = JsConnectionPointTypeFromArrayTypeMap[firstType] || JsConnectionPointType.FLOAT;
		return [outputType];
	}
	override setLines(linesController: JsLinesCollectionController) {
		const firstType = this._expectedInputTypes()[0] as JsConnectionPointTypeArray;
		switch (firstType) {
			case JsConnectionPointType.BOOLEAN_ARRAY:
			case JsConnectionPointType.FLOAT_ARRAY:
			case JsConnectionPointType.INT_ARRAY:
			case JsConnectionPointType.STRING_ARRAY: {
				return this._setLinesAsPrimitive(linesController);
			}
			case JsConnectionPointType.COLOR_ARRAY:
			case JsConnectionPointType.MATRIX4_ARRAY:
			case JsConnectionPointType.QUATERNION_ARRAY:
			case JsConnectionPointType.VECTOR2_ARRAY:
			case JsConnectionPointType.VECTOR3_ARRAY:
			case JsConnectionPointType.VECTOR4_ARRAY: {
				return this._setLinesAsVector(linesController);
			}
			case JsConnectionPointType.OBJECT_3D_ARRAY: {
				return this._setLinesAsPrimitive(linesController);
			}
			case JsConnectionPointType.INTERSECTION_ARRAY: {
				return this._setLinesAsPrimitive(linesController);
			}
			case JsConnectionPointType.TEXTURE_ARRAY: {
				return this._setLinesAsPrimitive(linesController);
			}
		}
		TypeAssert.unreachable(firstType);
	}
	protected _setLinesAsPrimitive(linesController: JsLinesCollectionController) {}
	protected _setLinesAsVector(linesController: JsLinesCollectionController) {}
	// private _setLinesAsObject(linesController: JsLinesCollectionController) {
	// 	console.warn('not implemented');
	// }
	// private _setLinesAsIntersection(linesController: JsLinesCollectionController) {
	// 	console.warn('not implemented');
	// }
	// private _setLinesAsTexture(linesController: JsLinesCollectionController) {
	// 	console.warn('not implemented');
	// }
}
