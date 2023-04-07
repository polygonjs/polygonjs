/**
 * Update the material uniform
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

type AvailableJsType =
	| JsConnectionPointType.COLOR
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.INT
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;

export const JS_CONNECTION_POINT_TYPES: Array<AvailableJsType> = [
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
const NUMBER_TYPES = new Set([JsConnectionPointType.FLOAT, JsConnectionPointType.INT]);
const DEFAULT_PARAM_VALUES = {lerp: 1};

enum SetMaterialUniformJsNodeInputName {
	uniformName = 'uniformName',
	lerp = 'lerp',
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
				[
					TRIGGER_CONNECTION_NAME,
					JsConnectionPointType.MATERIAL,
					this.uniformType(),
					SetMaterialUniformJsNodeInputName.uniformName,
					SetMaterialUniformJsNodeInputName.lerp,
				][index]
		);
		this.io.connection_points.set_expected_input_types_function(() => this._expectedInputType());
		this.io.connection_points.set_output_name_function((index: number) => TRIGGER_CONNECTION_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [JsConnectionPointType.TRIGGER]);
	}
	private _expectedInputType() {
		return [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.MATERIAL,
			this.uniformType(),
			JsConnectionPointType.STRING,
			JsConnectionPointType.FLOAT,
		];
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

	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const material = this.variableForInput(shadersCollectionController, JsConnectionPointType.MATERIAL);
		const uniformName = this.variableForInput(
			shadersCollectionController,
			SetMaterialUniformJsNodeInputName.uniformName
		);
		const uniformValue = this.variableForInput(shadersCollectionController, this.uniformType());
		const lerp = this.variableForInput(shadersCollectionController, SetMaterialUniformJsNodeInputName.lerp);

		const type = this.uniformType();
		const functionName = NUMBER_TYPES.has(type) ? 'setMaterialUniformNumber' : 'setMaterialUniformVectorColor';
		// if (NUMBER_TYPES.has(type)) {
		// 	const func = Poly.namedFunctionsRegister.g1etFunction(
		// 		'setMaterialUniformNumber',
		// 		this,
		// 		shadersCollectionController
		// 	);
		// 	const bodyLine = func.asString(material, uniformName, uniformValue,lerp);
		// 	shadersCollectionController.addActionBodyLines(this, [bodyLine]);
		// } else {
		// 	const func = Poly.namedFunctionsRegister.getFunction(
		// 		'setMaterialUniformVectorColor',
		// 		this,
		// 		shadersCollectionController
		// 	);
		// 	const bodyLine = func.asString(object3D, color, lerp);
		// 	shadersCollectionController.addActionBodyLines(this, [bodyLine]);
		// }
		// }
		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
		const bodyLine = func.asString(material, uniformName, uniformValue, lerp);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}

	// public override receiveTrigger(context: ActorNodeTriggerContext) {
	// 	const material =
	// 		this._inputValue<ActorConnectionPointType.MATERIAL>(ActorConnectionPointType.MATERIAL, context) ||
	// 		(context.Object3D as Mesh).material;

	// 	if (material) {
	// 		const lerp = this._inputValue<ActorConnectionPointType.FLOAT>('lerp', context) || 1;
	// 		const uniformNameWithoutPrefix =
	// 			this._inputValue<ActorConnectionPointType.STRING>('uniformName', context) || '';
	// 		const prefix = isBooleanTrue(this.pv.addPrefix) ? UNIFORM_PARAM_PREFIX : ``;
	// 		const uniformName = `${prefix}${uniformNameWithoutPrefix}`;
	// 		const paramValue = this._inputValue<any>(this.uniformType(), context);

	// 		if (CoreType.isArray(material)) {
	// 			for (let mat of material) {
	// 				this._updateMaterial(mat, uniformName, paramValue, lerp);
	// 			}
	// 		} else {
	// 			this._updateMaterial(material, uniformName, paramValue, lerp);
	// 		}
	// 	}

	// 	this.runTrigger(context);
	// }

	// private _updateMaterial(material: Material, uniformName: string, paramValue: any, lerp: number) {
	// 	const uniforms = MaterialUserDataUniforms.getUniforms(material);
	// 	if (!uniforms) {
	// 		return;
	// 	}
	// 	const uniform = uniforms[uniformName];
	// 	if (!uniform) {
	// 		return;
	// 	}
	// 	if (CoreType.isNumber(paramValue) && CoreType.isNumber(uniform.value)) {
	// 		if (lerp == 1) {
	// 			return (uniform.value = paramValue);
	// 		} else {
	// 			uniform.value = lerp * paramValue + (1 - lerp) * uniform.value;
	// 		}
	// 	}
	// 	if (CoreType.isVector(paramValue) && CoreType.isVector(uniform.value)) {
	// 		if (lerp == 1) {
	// 			return uniform.value.copy(paramValue as any);
	// 		} else {
	// 			return uniform.value.lerp(paramValue as any, lerp);
	// 		}
	// 	}
	// 	if (CoreType.isColor(paramValue) && CoreType.isColor(uniform.value)) {
	// 		if (lerp == 1) {
	// 			return uniform.value.copy(paramValue);
	// 		} else {
	// 			return uniform.value.lerp(paramValue, lerp);
	// 		}
	// 	}
	// }
}
