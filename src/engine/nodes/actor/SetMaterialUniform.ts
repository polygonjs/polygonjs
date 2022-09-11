/**
 * Update the material uniform
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Mesh} from 'three';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Material} from 'three';
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {UNIFORM_PARAM_PREFIX} from '../../../core/material/uniform';
import {MaterialUserDataUniforms} from '../gl/code/assemblers/materials/OnBeforeCompile';

type AvailableActorType =
	| ActorConnectionPointType.INTEGER
	| ActorConnectionPointType.FLOAT
	| ActorConnectionPointType.VECTOR2
	| ActorConnectionPointType.VECTOR3
	| ActorConnectionPointType.COLOR
	| ActorConnectionPointType.VECTOR4;

export const GL_CONNECTION_POINT_TYPES: Array<AvailableActorType> = [
	ActorConnectionPointType.INTEGER,
	ActorConnectionPointType.FLOAT,
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
	ActorConnectionPointType.COLOR,
	ActorConnectionPointType.VECTOR4,
];

class SetMaterialUniformActorParamsConfig extends NodeParamsConfig {
	/** @param add prefix */
	addPrefix = ParamConfig.BOOLEAN(1);
	/** @param uniform name */
	// uniformName = ParamConfig.STRING('');
	/** @param uniform type */
	type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
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
const ParamsConfig = new SetMaterialUniformActorParamsConfig();

export class SetMaterialUniformActorNode extends TypedActorNode<SetMaterialUniformActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setMaterialUniform';
	}

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['type']);
		this.io.connection_points.set_input_name_function(
			(index: number) =>
				[TRIGGER_CONNECTION_NAME, ActorConnectionPointType.MATERIAL, this.uniformType(), 'uniformName', 'lerp'][
					index
				]
		);
		this.io.connection_points.set_expected_input_types_function(() => this._expectedInputType());
		this.io.connection_points.set_output_name_function((index: number) => TRIGGER_CONNECTION_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.TRIGGER]);
	}
	private _expectedInputType() {
		return [
			ActorConnectionPointType.TRIGGER,
			ActorConnectionPointType.MATERIAL,
			this.uniformType(),
			ActorConnectionPointType.STRING,
			ActorConnectionPointType.FLOAT,
		];
	}
	uniformType() {
		return GL_CONNECTION_POINT_TYPES[this.pv.type] || ActorConnectionPointType.FLOAT;
	}
	setUniformType(type: AvailableActorType) {
		this.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(type));
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const material =
			this._inputValue<ActorConnectionPointType.MATERIAL>(ActorConnectionPointType.MATERIAL, context) ||
			(context.Object3D as Mesh).material;

		if (material) {
			const lerp = this._inputValue<ActorConnectionPointType.FLOAT>('lerp', context) || 1;
			const uniformNameWithoutPrefix =
				this._inputValue<ActorConnectionPointType.STRING>('uniformName', context) || '';
			const prefix = isBooleanTrue(this.pv.addPrefix) ? UNIFORM_PARAM_PREFIX : ``;
			const uniformName = `${prefix}${uniformNameWithoutPrefix}`;
			const paramValue = this._inputValue<any>(this.uniformType(), context);

			if (CoreType.isArray(material)) {
				for (let mat of material) {
					this._updateMaterial(mat, uniformName, paramValue, lerp);
				}
			} else {
				this._updateMaterial(material, uniformName, paramValue, lerp);
			}
		}

		this.runTrigger(context);
	}

	private _updateMaterial(material: Material, uniformName: string, paramValue: any, lerp: number) {
		const uniforms = MaterialUserDataUniforms.getUniforms(material);
		if (!uniforms) {
			return;
		}
		const uniform = uniforms[uniformName];
		if (!uniform) {
			return;
		}
		if (CoreType.isNumber(paramValue) && CoreType.isNumber(uniform.value)) {
			if (lerp == 1) {
				return (uniform.value = paramValue);
			} else {
				uniform.value = lerp * paramValue + (1 - lerp) * uniform.value;
			}
		}
		if (CoreType.isVector(paramValue) && CoreType.isVector(uniform.value)) {
			if (lerp == 1) {
				return uniform.value.copy(paramValue as any);
			} else {
				return uniform.value.lerp(paramValue as any, lerp);
			}
		}
		if (CoreType.isColor(paramValue) && CoreType.isColor(uniform.value)) {
			if (lerp == 1) {
				return uniform.value.copy(paramValue);
			} else {
				return uniform.value.lerp(paramValue, lerp);
			}
		}
	}
}
