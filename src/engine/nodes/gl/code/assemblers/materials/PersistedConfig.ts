import {PersistedConfig} from '../../../../utils/PersistedConfig';
import {BaseBuilderMatNodeType} from '../../../../mat/_BaseBuilder';
import {CustomMaterialName} from './_BaseMaterial';
import {ShaderMaterialWithCustomMaterials} from '../../../../../../core/geometry/Material';
import {MaterialLoader} from 'three/src/loaders/MaterialLoader';
import {IUniformsWithTime, IUniformsWithResolution} from '../../../../../scene/utils/UniformsController';
import {GlParamConfig} from '../../utils/ParamConfig';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {Texture} from 'three/src/textures/Texture';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Matrix3} from 'three/src/math/Matrix3';

export interface PersistedConfigBaseMaterialData {
	material: object;
	param_uniform_pairs: [string, string][];
	uniforms_time_dependent?: boolean;
	uniforms_resolution_dependent?: boolean;
	custom_materials?: Dictionary<object>;
}
interface MaterialData {
	color?: boolean;
	lights?: boolean;
}

// potential bug with Material Loader
// - 1. a uniform with a mat3, such as uvTransform, will be reloaded with a mat4
// - 2. the boolean lights property is not saved
// - 3. if a color property is added on the material itself, it should not be saved
// - 4. for the volume shader, a uniform with an array of vector can be saved, but not loaded again as a vector (but only as an {x,y,z} object)
export class BaseMaterialPersistedConfig extends PersistedConfig {
	private _material: ShaderMaterialWithCustomMaterials | undefined;
	constructor(protected node: BaseBuilderMatNodeType) {
		super(node);
	}
	to_json(): PersistedConfigBaseMaterialData | undefined {
		if (!this.node.assembler_controller) {
			return;
		}

		// custom materials
		const custom_materials_data: Dictionary<object> = {};
		const custom_materials = this.node.material.custom_materials;
		if (custom_materials) {
			const custom_material_names: CustomMaterialName[] = Object.keys(custom_materials) as CustomMaterialName[];
			for (let name of custom_material_names) {
				const custom_material = custom_materials[name];
				if (custom_material) {
					custom_materials_data[name] = this._material_to_json(custom_material);
				}
			}
		}

		// params updating uniforms
		const param_uniform_pairs: [string, string][] = [];
		const param_configs = this.node.assembler_controller.assembler.param_configs();
		for (let param_config of param_configs) {
			param_uniform_pairs.push([param_config.name, param_config.uniform_name]);
		}

		const data = {
			material: this._material_to_json(this.node.material),
			uniforms_time_dependent: this.node.assembler_controller.assembler.uniforms_time_dependent(),
			uniforms_resolution_dependent: this.node.assembler_controller.assembler.resolution_dependent(),
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
		if (2 > 1) return;

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
			this.node.scene.uniforms_controller.add_time_dependent_uniform_owner(
				this._material.uuid,
				this._material.uniforms as IUniformsWithTime
			);
		}
		if (data.uniforms_resolution_dependent) {
			this.node.scene.uniforms_controller.add_resolution_dependent_uniform_owner(
				this._material.uuid,
				this._material.uniforms as IUniformsWithResolution
			);
		}
		if (data.param_uniform_pairs) {
			for (let pair of data.param_uniform_pairs) {
				const param = this.node.params.get(pair[0]);
				const uniform = this._material.uniforms[pair[1]];
				if (param && uniform) {
					param.options.set({
						callback: () => {
							GlParamConfig.callback(param, uniform);
						},
					});
				}
			}
		}
	}

	private _material_to_json(material: ShaderMaterial): object {
		this._unassign_textures(material.uniforms);
		const material_data = material.toJSON({});
		if (material.lights != null) {
			material_data.lights = material.lights;
		}

		this._reassign_textures(material.uniforms);
		return material_data;
	}

	private _load_material(data: MaterialData): ShaderMaterialWithCustomMaterials | undefined {
		// if (2 > 1) {
		// 	return;
		// }

		// hack fix for properties that are assumed to be on normal materials
		// but are not on ShaderMaterial
		data.color = undefined;

		const loader = new MaterialLoader();
		const material = loader.parse(data) as ShaderMaterialWithCustomMaterials;

		// compensates for lights not being saved (and therefore cannot be loaded correctly)
		if (data.lights != null) {
			material.lights = data.lights;
		}

		// fix matrix that may be loaded as a mat4 instead of a mat3
		const uv2Transform = material.uniforms.uv2Transform;
		if (uv2Transform) {
			this.mat4_to_mat3(uv2Transform);
		}
		const uvTransform = material.uniforms.uvTransform;
		if (uvTransform) {
			this.mat4_to_mat3(uvTransform);
		}

		return material as ShaderMaterialWithCustomMaterials;
	}

	material(): ShaderMaterialWithCustomMaterials | undefined {
		return this._material;
	}

	private mat4_to_mat3(uniform: IUniform) {
		const mat4 = uniform.value;
		const last_element = mat4.elements[mat4.elements.length - 1];
		if (last_element == null) {
			const mat3 = new Matrix3();
			for (let i = 0; i < mat3.elements.length; i++) {
				mat3.elements[i] = mat4.elements[i];
			}
			uniform.value = mat3;
		}
	}

	private _found_texture_by_id: Map<string, Texture> = new Map();
	private _found_textures_id_by_uniform_name: Map<string, string> = new Map();
	private _unassign_textures(uniforms: Dictionary<IUniform>) {
		this._found_texture_by_id.clear();
		this._found_textures_id_by_uniform_name.clear();
		const names = Object.keys(uniforms);
		for (let name of names) {
			const value = uniforms[name].value;
			if (value && value.uuid) {
				const texture = value as Texture;
				this._found_texture_by_id.set(texture.uuid, value);
				this._found_textures_id_by_uniform_name.set(name, texture.uuid);
				uniforms[name].value = null;
			}
		}
	}
	private _reassign_textures(uniforms: Dictionary<IUniform>) {
		const names_needing_reassignment: string[] = [];
		this._found_textures_id_by_uniform_name.forEach((texture_id, name) => {
			names_needing_reassignment.push(name);
		});
		for (let name of names_needing_reassignment) {
			const texture_id = this._found_textures_id_by_uniform_name.get(name);
			if (texture_id) {
				const texture = this._found_texture_by_id.get(texture_id);
				if (texture) {
					uniforms[name].value = texture;
				}
			}
		}
	}
}
