/**
 * Updates a uniform of the input material
 *

 *
 */
import {Color, Material, ShaderMaterial, Vector2, Vector3, Vector4} from 'three';
import {UpdateMatNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	OnBeforeCompileDataHandler,
	cloneOnBeforeCompileData,
	assignOnBeforeCompileDataAndFunction,
} from '../gl/code/assemblers/materials/OnBeforeCompile';
import {GL_CONNECTION_POINT_TYPES_FOR_CONSTANT, GlConnectionPointType} from '../utils/io/connections/Gl';
import {isNumber} from '../../../core/Type';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {NodeContext} from '../../poly/NodeContext';
import {ParamType} from '../../poly/ParamType';
import {GlParamConfig} from '../gl/code/utils/GLParamConfig';
import {isBoolean} from '../../../core/Type';
import {BaseNodeType} from '../_Base';

export enum AdditionalType {
	COLOR = 'color',
	TEXTURE = 'texture',
}
const AVAILABLE_TYPES = [...GL_CONNECTION_POINT_TYPES_FOR_CONSTANT, AdditionalType.COLOR, AdditionalType.TEXTURE];

function typedVisibleOptions(
	type: GlConnectionPointType | AdditionalType,
	otherParamVal: PolyDictionary<number | boolean> = {}
) {
	const val = AVAILABLE_TYPES.indexOf(type);
	return {
		visibleIf: {type: val, ...otherParamVal},
		cook: false,
	};
}

class BuilderUniformUpdateMatParamsConfig extends NodeParamsConfig {
	/** @param name of the uniform */
	uniformName = ParamConfig.STRING('');
	/** @param type of the uniform */
	type = ParamConfig.INTEGER(AVAILABLE_TYPES.indexOf(GlConnectionPointType.FLOAT), {
		menu: {
			entries: AVAILABLE_TYPES.map((name, value) => ({name, value})),
		},
	});
	bool = ParamConfig.BOOLEAN(0, typedVisibleOptions(GlConnectionPointType.BOOL));
	int = ParamConfig.INTEGER(0, typedVisibleOptions(GlConnectionPointType.INT));
	float = ParamConfig.FLOAT(0, typedVisibleOptions(GlConnectionPointType.FLOAT));
	vec2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(GlConnectionPointType.VEC2));
	vec3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(GlConnectionPointType.VEC3));
	color = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(AdditionalType.COLOR));
	vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(GlConnectionPointType.VEC4));
	texture = ParamConfig.NODE_PATH('', {
		...typedVisibleOptions(AdditionalType.TEXTURE),
		nodeSelection: {context: NodeContext.COP},
		cook: false,
		callback: (node: BaseNodeType) => {
			BuilderUniformUpdateMatNode.PARAM_CALLBACK_updateTexture(node as BuilderUniformUpdateMatNode);
		},
	});
}
const ParamsConfig = new BuilderUniformUpdateMatParamsConfig();

export class BuilderUniformUpdateMatNode extends UpdateMatNode<ShaderMaterial, BuilderUniformUpdateMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'builderUniformUpdate';
	}

	private _paramConfig: GlParamConfig<ParamType> | undefined;
	override async cook(inputMaterials: Material[]) {
		const inputMaterial = inputMaterials[0] as ShaderMaterial;
		const material = inputMaterial.clone();
		material.needsUpdate = true;
		const uniformName = this.pv.uniformName;
		if (uniformName.trim() == '') {
			this.states.error.set(`uniform name is empty`);
			this.setMaterial(material);
			return;
		}

		const data = OnBeforeCompileDataHandler.getData(inputMaterial);

		if (!data) {
			this.states.error.set(`input material does not come from a builder material`);
			this.setMaterial(material);
			return;
		}
		const clonedData = cloneOnBeforeCompileData(data);
		const {paramConfigs} = clonedData;
		this._paramConfig = paramConfigs.find((p) => p.name() == this.pv.uniformName);
		if (!this._paramConfig) {
			this.states.error.set(`uniform '${this.pv.uniformName}' not found`);
			this.setMaterial(material);
			return;
		}
		await this.applyCurrentParam();

		assignOnBeforeCompileDataAndFunction(this.scene(), material, clonedData);

		this.setMaterial(material);
	}

	setType(type: GlConnectionPointType | AdditionalType) {
		this.p.type.set(AVAILABLE_TYPES.indexOf(type));
	}

	private async _updateTexture() {
		if (!this._paramConfig) {
			return;
		}
		const textureNode = this.p.texture.value.nodeWithContext(NodeContext.COP);
		if (textureNode) {
			const container = await textureNode.compute();

			const texture = container.texture();
			this._paramConfig.uniform().value = texture;
		} else {
			this._paramConfig.uniform().value = null;
		}
	}
	static PARAM_CALLBACK_updateTexture(node: BuilderUniformUpdateMatNode) {
		node._updateTexture();
	}

	async applyCurrentParam() {
		if (!this._paramConfig) {
			return;
		}
		const type = AVAILABLE_TYPES[this.pv.type];
		const uniform = this._paramConfig.uniform();
		switch (type) {
			case GlConnectionPointType.BOOL: {
				if (isBoolean(uniform.value)) {
					uniform.value = this.pv.bool;
				} else {
					this.states.error.set('uniform is not a boolean');
				}
				return;
			}
			case GlConnectionPointType.INT: {
				if (isNumber(uniform.value)) {
					uniform.value = this.pv.int;
				} else {
					this.states.error.set('uniform is not an int');
				}
				return;
			}
			case GlConnectionPointType.FLOAT: {
				if (isNumber(uniform.value)) {
					uniform.value = this.pv.float;
				} else {
					this.states.error.set('uniform is not a float');
				}
				return;
			}
			case GlConnectionPointType.VEC2: {
				if (uniform.value instanceof Vector2) {
					uniform.value = this.pv.vec2;
				} else {
					this.states.error.set('uniform is not a vec2');
				}
				return;
			}
			case GlConnectionPointType.VEC3: {
				if (uniform.value instanceof Vector3) {
					uniform.value = this.pv.vec3;
				} else {
					this.states.error.set('uniform is not a vec3');
				}
				return;
			}
			case GlConnectionPointType.VEC4: {
				if (uniform.value instanceof Vector4) {
					uniform.value = this.pv.vec4;
				} else {
					this.states.error.set('uniform is not a vec4');
				}
				return;
			}
			case AdditionalType.COLOR: {
				if (uniform.value instanceof Color) {
					uniform.value = this.pv.color;
				} else {
					this.states.error.set('uniform is not a color');
				}

				return;
			}
			case AdditionalType.TEXTURE: {
				await this._updateTexture();
				return;
			}
		}
	}
}
