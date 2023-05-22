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
import {inputObject3DMaterial} from './_BaseObject3D';
import {ArrayUtils} from '../../../core/ArrayUtils';

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
	addPrefix = 'addPrefix',
}

class SetMaterialUniformJsParamsConfig extends NodeParamsConfig {
	/** @param add prefix */
	addPrefix = ParamConfig.BOOLEAN(1);
	/** @param uniform name */
	// uniformName = ParamConfig.STRING('');
	/** @param uniform type */
	type = ParamConfig.INTEGER(JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param lerp */
	// lerp cannot yet be a parameter,
	// otherwise it will not appear as a named input
	// lerp = ParamConfig.FLOAT(1, {
	// 	range: [0, 1],
	// 	rangeLocked: [false, false],
	// });
}
const ParamsConfig = new SetMaterialUniformJsParamsConfig();

export class SetMaterialUniformJsNode extends TypedJsNode<SetMaterialUniformJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setMaterialUniform';
	}

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['type']);
		this.io.connection_points.set_input_name_function(
			(index: number) =>
				ArrayUtils.compact([
					TRIGGER_CONNECTION_NAME,
					JsConnectionPointType.MATERIAL,
					this.uniformType(),
					SetMaterialUniformJsNodeInputName.uniformName,
					this._lerpAllowed() ? SetMaterialUniformJsNodeInputName.lerp : null,
					SetMaterialUniformJsNodeInputName.addPrefix,
				])[index]
		);
		this.io.connection_points.set_expected_input_types_function(() => this._expectedInputType());
		this.io.connection_points.set_output_name_function((index: number) => TRIGGER_CONNECTION_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [JsConnectionPointType.TRIGGER]);
	}
	private _expectedInputType() {
		return ArrayUtils.compact([
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.MATERIAL,
			this.uniformType(),
			JsConnectionPointType.STRING,
			this._lerpAllowed() ? JsConnectionPointType.FLOAT : null,
			JsConnectionPointType.BOOLEAN,
		]);
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

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const material = inputObject3DMaterial(this, shadersCollectionController);
		const uniformName = this.variableForInput(
			shadersCollectionController,
			SetMaterialUniformJsNodeInputName.uniformName
		);
		const uniformValue = this.variableForInput(shadersCollectionController, this.uniformType());
		const lerp = this.variableForInput(shadersCollectionController, SetMaterialUniformJsNodeInputName.lerp);
		const addPrefix = this.variableForInput(
			shadersCollectionController,
			SetMaterialUniformJsNodeInputName.addPrefix
		);

		if (this._isUniformNumber()) {
			const functionName = 'setMaterialUniformNumber';
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const bodyLine = func.asString(material, uniformName, uniformValue, lerp, addPrefix);
			shadersCollectionController.addTriggerableLines(this, [bodyLine]);
			return;
		}
		if (this._isUniformVectorColor()) {
			const functionName = 'setMaterialUniformVectorColor';
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const bodyLine = func.asString(material, uniformName, uniformValue, lerp, addPrefix);
			shadersCollectionController.addTriggerableLines(this, [bodyLine]);
			return;
		} else {
			const functionName = 'setMaterialUniformTexture';
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const bodyLine = func.asString(material, uniformName, uniformValue, addPrefix);
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
