/**
 * Update the material uniform
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {
	floatOutputFromInput,
	stringOutputFromInput,
	anyTypeOutputFromInput,
	inputObject3DMaterial,
	setObject3DMaterialOutputLine,
} from './_BaseObject3D';

type AvailableJsType =
	| JsConnectionPointType.COLOR
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.INT
	| JsConnectionPointType.TEXTURE
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;

export const JS_CONNECTION_POINT_TYPES: Array<AvailableJsType> = [
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.TEXTURE,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
const NUMBER_TYPES = new Set([JsConnectionPointType.FLOAT, JsConnectionPointType.INT]);
const VECTOR_COLOR_TYPES = new Set([
	JsConnectionPointType.COLOR,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
]);
const DEFAULT_PARAM_VALUES = {lerp: 1, addPrefix: 1};

enum SetMaterialUniformJsNodeInputName {
	uniformName = 'uniformName',
	lerp = 'lerp',
}

class SetMaterialUniformJsParamsConfig extends NodeParamsConfig {
	/** @param printWarnings */
	printWarnings = ParamConfig.BOOLEAN(1);
	/** @param add prefix */
	addPrefix = ParamConfig.BOOLEAN(1);
	/** @param uniform type */
	type = ParamConfig.INTEGER(JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
		separatorBefore: true,
	});
}
const ParamsConfig = new SetMaterialUniformJsParamsConfig();

export class SetMaterialUniformJsNode extends TypedJsNode<SetMaterialUniformJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setMaterialUniform';
	}

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['type']);
		this.io.connection_points.set_input_name_function(this._expectedInputNames.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputType.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedInputNames.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedInputType.bind(this));
	}
	private _expectedInputNames(index: number) {
		const list = [
			TRIGGER_CONNECTION_NAME,
			JsConnectionPointType.MATERIAL,
			this.uniformType(),
			SetMaterialUniformJsNodeInputName.uniformName,
		];
		if (this._lerpAllowed()) {
			list.push(SetMaterialUniformJsNodeInputName.lerp);
		}
		return list[index];
	}
	private _expectedInputType() {
		const list = [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.MATERIAL,
			this.uniformType(),
			JsConnectionPointType.STRING,
		];
		if (this._lerpAllowed()) {
			list.push(JsConnectionPointType.FLOAT);
		}
		return list;
	}

	override paramDefaultValue(name: 'lerp') {
		return DEFAULT_PARAM_VALUES[name];
	}
	uniformType() {
		return JS_CONNECTION_POINT_TYPES[this.pv.type] || JsConnectionPointType.FLOAT;
	}

	setUniformType(type: AvailableJsType) {
		this.p.type.set(JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DMaterialOutputLine(this, linesController);

		anyTypeOutputFromInput(this, this.uniformType(), linesController);
		floatOutputFromInput(this, SetMaterialUniformJsNodeInputName.lerp, linesController);
		stringOutputFromInput(this, SetMaterialUniformJsNodeInputName.uniformName, linesController);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const material = inputObject3DMaterial(this, shadersCollectionController);
		const uniformName = this.variableForInput(
			shadersCollectionController,
			SetMaterialUniformJsNodeInputName.uniformName
		);
		const uniformValue = this.variableForInput(shadersCollectionController, this.uniformType());
		const printWarnings = this.pv.printWarnings ? 'true' : 'false';
		const addPrefix = this.pv.addPrefix ? 'true' : 'false';

		if (this._isUniformNumber() || this._isUniformVectorColor()) {
			const lerp = this.variableForInput(shadersCollectionController, SetMaterialUniformJsNodeInputName.lerp);
			if (this._isUniformNumber()) {
				const functionName = 'setMaterialUniformNumber';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				const bodyLine = func.asString(material, uniformName, uniformValue, lerp, addPrefix, printWarnings);
				shadersCollectionController.addTriggerableLines(this, [bodyLine]);
				return;
			}
			if (this._isUniformVectorColor()) {
				const functionName = 'setMaterialUniformVectorColor';
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
				const bodyLine = func.asString(material, uniformName, uniformValue, lerp, addPrefix, printWarnings);
				shadersCollectionController.addTriggerableLines(this, [bodyLine]);
				return;
			}
		} else {
			const functionName = 'setMaterialUniformTexture';
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const bodyLine = func.asString(material, uniformName, uniformValue, addPrefix, printWarnings);
			shadersCollectionController.addTriggerableLines(this, [bodyLine]);
			return;
		}
	}

	private _isUniformNumber() {
		return NUMBER_TYPES.has(this.uniformType());
	}
	private _isUniformVectorColor() {
		return VECTOR_COLOR_TYPES.has(this.uniformType());
	}
	private _lerpAllowed() {
		return this._isUniformNumber() || this._isUniformVectorColor();
	}
}
