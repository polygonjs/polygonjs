import {BasePersistedConfig} from '../../../../utils/PersistedConfig';
import {BaseBuilderMatNodeType} from '../../../../mat/_BaseBuilder';
import {CustomMaterialName} from './_BaseMaterial';
import {ShaderMaterialWithCustomMaterials} from '../../../../../../core/geometry/Material';
import {IUniformsWithTime, IUniformsWithResolution} from '../../../../../scene/utils/UniformsController';
import {GlParamConfig} from '../../utils/ParamConfig';
import {Poly} from '../../../../../Poly';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

export interface PersistedConfigBaseMaterialData {
	material: object;
	param_uniform_pairs: [string, string][];
	uniforms_time_dependent?: boolean;
	uniforms_resolution_dependent?: boolean;
	customMaterials?: PolyDictionary<object>;
}

// potential bug with Material Loader
// - 1. a uniform with a mat3, such as uvTransform, will be reloaded with a mat4
// - 2. the boolean lights property is not saved
// - 3. if a color property is added on the material itself, it should not be saved
// - 4. for the volume shader, a uniform with an array of vector can be saved, but not loaded again as a vector (but only as an {x,y,z} object)
export class MaterialPersistedConfig extends BasePersistedConfig {
	private _material: ShaderMaterialWithCustomMaterials | undefined;
	constructor(protected override node: BaseBuilderMatNodeType) {
		super(node);
	}
	override toJSON(): PersistedConfigBaseMaterialData | undefined {
		const assemblerController = this.node.assemblerController;
		if (!assemblerController) {
			return;
		}

		// custom materials
		const customMaterialsData: PolyDictionary<object> = {};
		const customMaterials = this.node.material.customMaterials;
		if (customMaterials) {
			const customMaterialNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
			for (let customMaterialName of customMaterialNames) {
				const custom_material = customMaterials[customMaterialName];
				if (custom_material) {
					const material_data = this._materialToJson(custom_material, {
						node: this.node,
						suffix: customMaterialName,
					});
					if (material_data) {
						customMaterialsData[customMaterialName] = material_data;
					}
				}
			}
		}

		// params updating uniforms
		const param_uniform_pairs: [string, string][] = [];
		const param_configs = assemblerController.assembler.param_configs();
		for (let param_config of param_configs) {
			param_uniform_pairs.push([param_config.name(), param_config.uniform_name]);
		}

		const material_data = this._materialToJson(this.node.material, {node: this.node, suffix: 'main'});
		if (!material_data) {
			console.warn('failed to save material from node', this.node.path());
		}

		const data = {
			material: material_data || {},
			uniforms_time_dependent: assemblerController.assembler.uniformsTimeDependent(),
			uniforms_resolution_dependent: assemblerController.assembler.uniforms_resolution_dependent(),
			param_uniform_pairs: param_uniform_pairs,
			customMaterials: customMaterialsData,
		};
		return data;
	}
	override load(data: PersistedConfigBaseMaterialData) {
		this._material = this._loadMaterial(data.material);
		if (!this._material) {
			return;
		}

		this._material.customMaterials = this._material.customMaterials || {};
		if (data.customMaterials) {
			const customMatNames: CustomMaterialName[] = Object.keys(data.customMaterials) as CustomMaterialName[];
			for (let customMatName of customMatNames) {
				const custom_mat_data = data.customMaterials[customMatName];
				const custom_mat = this._loadMaterial(custom_mat_data);
				if (custom_mat) {
					this._material.customMaterials[customMatName] = custom_mat;

					// console.log('=============', customMatName);
					// We could link the customMaterial's uniform here
					// and get them in sync,
					// but this seems to have unexpected side-effects
					// and some assigned textures do not get assigned as expected.
					// Therefore, the syncing is done later in this method,
					// when setting the param callback
					// const uniformNames = Object.keys(this._material.uniforms);
					// for (let uniformName of uniformNames) {
					// 	const customMatUniform = custom_mat.uniforms[uniformName];
					// 	if (customMatUniform) {
					// 		console.log(
					// 			uniformName,
					// 			custom_mat.uniforms[uniformName].value,
					// 			this._material.uniforms[uniformName].value
					// 		);
					// 		// if the uniform exists in the customMat, replace it completely (not just its value)
					// 		// so that it is garantied to be in sync with the parent material
					// 		// custom_mat.uniforms[uniformName] = this._material.uniforms[uniformName];
					// 	}
					// }
				}
			}
		}

		if (data.uniforms_time_dependent) {
			this.node
				.scene()
				.uniformsController.addTimeDependentUniformOwner(
					this._material.uuid,
					this._material.uniforms as IUniformsWithTime
				);
		}
		if (data.uniforms_resolution_dependent) {
			this.node
				.scene()
				.uniformsController.addResolutionDependentUniformOwner(
					this._material.uuid,
					this._material.uniforms as IUniformsWithResolution
				);
		}
		if (data.param_uniform_pairs) {
			for (let pair of data.param_uniform_pairs) {
				const paramName = pair[0];
				const uniformName = pair[1];
				const param = this.node.params.get(paramName);
				const uniform = this._material.uniforms[uniformName];

				const customMatNames: CustomMaterialName[] = Object.keys(
					this._material.customMaterials
				) as CustomMaterialName[];
				let customUniforms: IUniform[] | undefined;
				for (let customMatName of customMatNames) {
					const customMat = this._material.customMaterials[customMatName];
					const customUniform = customMat?.uniforms[uniformName];
					if (customUniform) {
						customUniforms = customUniforms || [];
						customUniforms.push(customUniform);
					}
				}
				if (param && (uniform || customUniforms)) {
					const callback = () => {
						if (uniform) {
							GlParamConfig.callback(param, uniform);
						}
						if (customUniforms) {
							for (let customUniform of customUniforms) {
								GlParamConfig.callback(param, customUniform);
							}
						}
					};
					param.options.setOption('callback', callback);
					// it's best to execute the callback directly
					// as it may otherwise be prevented if the scene is loading for instance
					// and this is currently necessary for ramp params, when no assembler is loaded
					callback();
					// param.options.executeCallback();
				}
			}
		}
	}

	material(): ShaderMaterialWithCustomMaterials | undefined {
		if (Poly.playerMode()) {
			return this._material;
		}
	}
}
