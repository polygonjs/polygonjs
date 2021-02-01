import {BasePersistedConfig} from '../../../../utils/PersistedConfig';
import {BaseBuilderMatNodeType} from '../../../../mat/_BaseBuilder';
import {CustomMaterialName} from './_BaseMaterial';
import {ShaderMaterialWithCustomMaterials} from '../../../../../../core/geometry/Material';
import {IUniformsWithTime, IUniformsWithResolution} from '../../../../../scene/utils/UniformsController';
import {GlParamConfig} from '../../utils/ParamConfig';
import {Poly} from '../../../../../Poly';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';

export interface PersistedConfigBaseMaterialData {
	material: object;
	param_uniform_pairs: [string, string][];
	uniforms_time_dependent?: boolean;
	uniforms_resolution_dependent?: boolean;
	custom_materials?: PolyDictionary<object>;
}

// potential bug with Material Loader
// - 1. a uniform with a mat3, such as uvTransform, will be reloaded with a mat4
// - 2. the boolean lights property is not saved
// - 3. if a color property is added on the material itself, it should not be saved
// - 4. for the volume shader, a uniform with an array of vector can be saved, but not loaded again as a vector (but only as an {x,y,z} object)
export class MaterialPersistedConfig extends BasePersistedConfig {
	private _material: ShaderMaterialWithCustomMaterials | undefined;
	constructor(protected node: BaseBuilderMatNodeType) {
		super(node);
	}
	toJSON(): PersistedConfigBaseMaterialData | undefined {
		const assemblerController = this.node.assemblerController;
		if (!assemblerController) {
			return;
		}

		// custom materials
		const custom_materials_data: PolyDictionary<object> = {};
		const custom_materials = this.node.material.custom_materials;
		if (custom_materials) {
			const custom_material_names: CustomMaterialName[] = Object.keys(custom_materials) as CustomMaterialName[];
			for (let name of custom_material_names) {
				const custom_material = custom_materials[name];
				if (custom_material) {
					const material_data = this._material_to_json(custom_material);
					if (material_data) {
						custom_materials_data[name] = material_data;
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

		const material_data = this._material_to_json(this.node.material);
		if (!material_data) {
			console.warn('failed to save material from node', this.node.fullPath());
		}

		const data = {
			material: material_data || {},
			uniforms_time_dependent: assemblerController.assembler.uniforms_time_dependent(),
			uniforms_resolution_dependent: assemblerController.assembler.resolution_dependent(),
			param_uniform_pairs: param_uniform_pairs,
			custom_materials: custom_materials_data,
		};
		return data;
	}
	load(data: PersistedConfigBaseMaterialData) {
		this._material = this._load_material(data.material);
		if (!this._material) {
			return;
		}

		this._material.custom_materials = this._material.custom_materials || {};
		if (data.custom_materials) {
			const names: CustomMaterialName[] = Object.keys(data.custom_materials) as CustomMaterialName[];
			for (let name of names) {
				const custom_mat_data = data.custom_materials[name];
				const custom_mat = this._load_material(custom_mat_data);
				if (custom_mat) {
					this._material.custom_materials[name] = custom_mat;
				}
			}
		}

		if (data.uniforms_time_dependent) {
			this.node
				.scene()
				.uniforms_controller.add_time_dependent_uniform_owner(
					this._material.uuid,
					this._material.uniforms as IUniformsWithTime
				);
		}
		if (data.uniforms_resolution_dependent) {
			this.node
				.scene()
				.uniforms_controller.add_resolution_dependent_uniform_owner(
					this._material.uuid,
					this._material.uniforms as IUniformsWithResolution
				);
		}
		if (data.param_uniform_pairs) {
			for (let pair of data.param_uniform_pairs) {
				const param = this.node.params.get(pair[0]);
				const uniform = this._material.uniforms[pair[1]];
				if (param && uniform) {
					param.options.set_option('callback', () => {
						GlParamConfig.callback(param, uniform);
					});
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
