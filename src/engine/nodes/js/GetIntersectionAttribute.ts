/**
 * get an intersection attribute
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPointType,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {StringParam} from '../../params/String';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {TypeAssert} from '../../poly/Assert';

enum GetIntersectionAttributeInputName {
	attribName = 'attribName',
	notFoundValue = 'notFoundValue',
}

class GetIntersectionAttributeJsParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, value) => ({name, value})),
		},
	});
	interpolated = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new GetIntersectionAttributeJsParamsConfig();

export class GetIntersectionAttributeJsNode extends TypedJsNode<GetIntersectionAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getIntersectionAttribute';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['interpolated']);

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => [this.attribType()]);
		this.io.connection_points.set_input_name_function(this._expectedInputNames.bind(this));
		this.io.connection_points.set_output_name_function(
			(index: number) => GetIntersectionAttributeJsNode.OUTPUT_NAME
		);
	}
	private _expectedInputTypes() {
		return [JsConnectionPointType.INTERSECTION, JsConnectionPointType.STRING, this.attribType()];
	}
	private _expectedInputNames(index: number) {
		return [
			JsConnectionPointType.INTERSECTION,
			GetIntersectionAttributeInputName.attribName,
			GetIntersectionAttributeInputName.notFoundValue,
		][index];
	}

	private _nextAttribName: string = '';
	override paramDefaultValue(name: GetIntersectionAttributeInputName) {
		return {
			[GetIntersectionAttributeInputName.attribName]: this._nextAttribName,
			[GetIntersectionAttributeInputName.notFoundValue]: -1,
		}[name];
	}
	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	attribType() {
		return PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type] as ParamConvertibleJsType;
	}
	setAttribName(attribName: string) {
		const param = this.params.get(GetIntersectionAttributeInputName.attribName) as StringParam | undefined;
		if (param) {
			param.set(attribName);
		} else {
			this._nextAttribName = attribName;
		}
	}
	attributeName() {
		return (this.params.get(GetIntersectionAttributeInputName.attribName) as StringParam).value;
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const varName = this.jsVarName(GetIntersectionAttributeJsNode.OUTPUT_NAME);
		const dataType = this.attribType();

		const bodyLine = this._getBodyLine(shadersCollectionController);
		if (bodyLine) {
			shadersCollectionController.addBodyOrComputed(this, [{dataType, varName, value: bodyLine}]);
		}
	}
	private _getBodyLine(shadersCollectionController: JsLinesCollectionController) {
		const intersection = this.variableForInput(shadersCollectionController, JsConnectionPointType.INTERSECTION);
		const attribName = this.variableForInput(
			shadersCollectionController,
			GetIntersectionAttributeInputName.attribName
		);
		const notFoundValue = this.variableForInput(
			shadersCollectionController,
			GetIntersectionAttributeInputName.notFoundValue
		);
		const interpolated = this.pv.interpolated;

		const dataType = this.attribType();
		switch (dataType) {
			case JsConnectionPointType.BOOLEAN:
			case JsConnectionPointType.FLOAT:
			case JsConnectionPointType.INT: {
				const functionName = interpolated
					? 'getIntersectionAttributeNumberInterpolated'
					: 'getIntersectionAttributeNumberNearest';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				return func.asString(intersection, attribName, notFoundValue);
			}
			case JsConnectionPointType.COLOR: {
				const functionName = interpolated
					? 'getIntersectionAttributeColorInterpolated'
					: 'getIntersectionAttributeColorNearest';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				const variable = createVariable(dataType);
				if (variable) {
					const tmpVarName = shadersCollectionController.addVariable(this, variable);
					func.asString(intersection, attribName, notFoundValue, tmpVarName);
				}
				return;
			}
			case JsConnectionPointType.STRING: {
				const functionName = 'getIntersectionAttributeStringNearest';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				func.asString(intersection, attribName);
				return;
			}
			case JsConnectionPointType.VECTOR2: {
				const functionName = interpolated
					? 'getIntersectionAttributeVector2Interpolated'
					: 'getIntersectionAttributeVector2Nearest';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				const variable = createVariable(dataType);
				if (variable) {
					const tmpVarName = shadersCollectionController.addVariable(this, variable);
					func.asString(intersection, attribName, notFoundValue, tmpVarName);
				}
				return;
			}
			case JsConnectionPointType.VECTOR3: {
				const functionName = interpolated
					? 'getIntersectionAttributeVector3Interpolated'
					: 'getIntersectionAttributeVector3Nearest';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				const variable = createVariable(dataType);
				if (variable) {
					const tmpVarName = shadersCollectionController.addVariable(this, variable);
					func.asString(intersection, attribName, notFoundValue, tmpVarName);
				}
				return;
			}
			case JsConnectionPointType.VECTOR4: {
				const functionName = interpolated
					? 'getIntersectionAttributeVector4Interpolated'
					: 'getIntersectionAttributeVector4Nearest';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				const variable = createVariable(dataType);
				if (variable) {
					const tmpVarName = shadersCollectionController.addVariable(this, variable);
					func.asString(intersection, attribName, notFoundValue, tmpVarName);
				}
				return;
			}
		}

		TypeAssert.unreachable(dataType);
	}
}
