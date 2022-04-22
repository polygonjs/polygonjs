import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {BaseBuilderMatNodeType} from '../../../../mat/_BaseBuilder';
import {CustomMaterialName} from './_BaseMaterial';
import {ShaderMaterialWithCustomMaterials, MaterialWithCustomMaterials} from '../../../../../../core/geometry/Material';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';
import {ShaderMaterial} from 'three';
import {
	assignOnBeforeCompileDataAndFunction,
	OnBeforeCompileDataConverter,
	OnBeforeCompileDataJSON,
} from './OnBeforeCompile';

export interface PersistedConfigBaseMaterialData {
	material: object;
	// param_uniform_pairs: [string, string][];
	// uniforms_time_dependent?: boolean;
	// uniforms_resolution_dependent?: boolean;
	onBeforeCompileDataJSON: OnBeforeCompileDataJSON;
	customMaterials?: PolyDictionary<PersistedConfigBaseMaterialData>;
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
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const assembler = assemblerController.assembler;
		const onBeforeCompileData = assembler.onBeforeCompileData();
		if (!onBeforeCompileData) {
			return;
		}
		const onBeforeCompileDataJSON = OnBeforeCompileDataConverter.toJSON(onBeforeCompileData);

		// custom materials
		const customMaterialsData: PolyDictionary<PersistedConfigBaseMaterialData> = {};
		const customMaterials = this.node.material.customMaterials;
		if (customMaterials) {
			assembler.traverseCustomAssemblers((customAssembler, customMaterialName) => {
				const customOnBeforeCompileData = customAssembler.onBeforeCompileData();
				if (customOnBeforeCompileData) {
					const customMaterial = customMaterials[customMaterialName] as ShaderMaterial;
					if (customMaterial) {
						const customMaterialData = this._materialToJson(customMaterial, {
							node: this.node,
							suffix: customMaterialName,
						});
						if (customMaterialData) {
							customMaterialsData[customMaterialName] = {
								material: customMaterialData,
								onBeforeCompileDataJSON: OnBeforeCompileDataConverter.toJSON(customOnBeforeCompileData),
							};
						}
					}
				}
			});

			// const customMaterialNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
			// for (let customMaterialName of customMaterialNames) {

			// }
		}

		// params updating uniforms
		// const param_uniform_pairs: [string, string][] = [];
		// const param_configs = assemblerController.assembler.param_configs();
		// for (let param_config of param_configs) {
		// 	param_uniform_pairs.push([param_config.name(), param_config.uniformName()]);
		// }

		const materialData = this._materialToJson(this.node.material as ShaderMaterialWithCustomMaterials, {
			node: this.node,
			suffix: 'main',
		});
		if (!materialData) {
			console.warn('failed to save material from node', this.node.path());
		}

		const data: PersistedConfigBaseMaterialData = {
			material: materialData || {},
			onBeforeCompileDataJSON,
			// uniforms_time_dependent: assemblerController.assembler.uniformsTimeDependent(),
			// uniforms_resolution_dependent: assemblerController.assembler.uniformsResolutionDependent(),
			// param_uniform_pairs: param_uniform_pairs,
			customMaterials: customMaterialsData,
		};
		return data;
	}
	override load(data: PersistedConfigBaseMaterialData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}
		this._material = this._loadMaterial(data.material);
		if (!this._material) {
			return;
		}

		// const shaderMaterial = this._material as ShaderMaterial;

		const onBeforeCompileData = OnBeforeCompileDataConverter.fromJSON(data.onBeforeCompileDataJSON);
		const material = this._material;
		assignOnBeforeCompileDataAndFunction(this.node.scene(), material, onBeforeCompileData);

		for (let paramConfig of onBeforeCompileData.paramConfigs) {
			paramConfig.applyToNode(this.node);
		}

		// material.onBeforeCompile = (shader: Shader) => {
		// 	onBeforeCompile(shader);

		// 	if (data.onBeforeCompileDataJSON.paramConfigs) {
		// 		for (let paramConfigJSON of data.onBeforeCompileDataJSON.paramConfigs) {
		// 			const paramName = paramConfigJSON.name;
		// 			const uniformName = paramConfigJSON.uniformName;
		// 			const param = this.node.params.get(paramName);
		// 			const uniform = shader.uniforms[uniformName];

		// 			const customMatNames: CustomMaterialName[] = Object.keys(
		// 				material.customMaterials
		// 			) as CustomMaterialName[];
		// 			let customUniforms: IUniform[] | undefined;
		// 			for (let customMatName of customMatNames) {
		// 				const customMat = material.customMaterials[customMatName] as ShaderMaterial;
		// 				const customUniform = customMat?.uniforms[uniformName];
		// 				if (customUniform) {
		// 					customUniforms = customUniforms || [];
		// 					customUniforms.push(customUniform);
		// 				}
		// 			}
		// 			if (param && (uniform || customUniforms)) {
		// 				const callback = () => {
		// 					if (uniform) {
		// 						GlParamConfig.callback(param, uniform);
		// 					}
		// 					if (customUniforms) {
		// 						for (let customUniform of customUniforms) {
		// 							GlParamConfig.callback(param, customUniform);
		// 						}
		// 					}
		// 				};
		// 				param.options.setOption('callback', callback);
		// 				// it's best to execute the callback directly
		// 				// as it may otherwise be prevented if the scene is loading for instance
		// 				// and this is currently necessary for ramp params, when no assembler is loaded
		// 				callback();
		// 				// param.options.executeCallback();
		// 			}
		// 		}
		// 	}
		// };

		// load custom materials
		this._material.customMaterials = this._material.customMaterials || {};
		if (data.customMaterials) {
			const customMatNames: CustomMaterialName[] = Object.keys(data.customMaterials) as CustomMaterialName[];
			for (let customMatName of customMatNames) {
				const customMatData = data.customMaterials[customMatName];
				const customMat = this._loadMaterial(customMatData.material);
				if (customMat) {
					const customOnBeforeCompileData = OnBeforeCompileDataConverter.fromJSON(
						customMatData.onBeforeCompileDataJSON
					);
					customOnBeforeCompileData.paramConfigs = onBeforeCompileData.paramConfigs;

					assignOnBeforeCompileDataAndFunction(this.node.scene(), customMat, customOnBeforeCompileData);
					this._material.customMaterials[customMatName] = customMat;

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

		// if (shaderMaterial.uniforms) {
		// 	if (data.uniforms_time_dependent) {
		// 		this.node
		// 			.scene()
		// 			.uniformsController.addTimeDependentUniformOwner(
		// 				this._material.uuid,
		// 				this._material.uniforms as IUniformsWithTime
		// 			);
		// 	}
		// 	if (data.uniforms_resolution_dependent) {
		// 		this.node
		// 			.scene()
		// 			.uniformsController.addResolutionDependentUniformOwner(
		// 				this._material.uuid,
		// 				this._material.uniforms as IUniformsWithResolution
		// 			);
		// 	}
	}

	material(): MaterialWithCustomMaterials | undefined {
		// do not check playerMode, but if the node has an assembler instead
		// if (Poly.playerMode()) {
		return this._material;
		// }
	}
}
