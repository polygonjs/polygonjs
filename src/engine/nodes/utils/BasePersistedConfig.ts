import {BaseNodeType} from '../_Base';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Texture} from 'three/src/textures/Texture';
import {Matrix3} from 'three/src/math/Matrix3';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {MaterialLoader} from 'three/src/loaders/MaterialLoader';
import {Material} from 'three/src/materials/Material';
interface MaterialData {
	color?: boolean;
	lights?: boolean;
}

interface ToJsonOptions {
	node: BaseNodeType;
	suffix: string;
}
export class BasePersistedConfig {
	constructor(protected node: BaseNodeType) {}
	toJSON(): object | void {}
	load(data: object) {}

	//
	//
	// SAVE MAT
	//
	//
	protected _materialToJson(material: ShaderMaterial, options: ToJsonOptions): object | undefined {
		this._unassignTextures(material);

		let material_data: object | undefined = undefined;
		try {
			material_data = material.toJSON({});
			if (material_data) {
				// those properties are currently not handled in three.js
				// TODO: wait for https://github.com/mrdoob/three.js/pull/21428
				// to be merged
				(material_data as any).shadowSide = material.shadowSide;
				(material_data as any).colorWrite = material.colorWrite;
			}
		} catch (err) {
			console.error('failed to save material data');
			console.log(material);
		}
		if (material_data && material.lights != null) {
			(material_data as any).lights = material.lights;
		}
		if (material_data) {
			// here we force the uuid to an expected value,
			// so that it does not get overriden at each load/save
			(material_data as any).uuid = `${options.node.path()}-${options.suffix}`;
		}

		this._reassignTextures(material);
		return material_data;
	}

	private _found_uniform_texture_by_id: Map<string, Texture> = new Map();
	private _found_uniform_textures_id_by_uniform_name: Map<string, string> = new Map();
	private _found_param_texture_by_id: Map<string, Texture> = new Map();
	private _found_param_textures_id_by_uniform_name: Map<string, string> = new Map();
	private _unassignTextures(material: ShaderMaterial) {
		this._found_uniform_texture_by_id.clear();
		this._found_uniform_textures_id_by_uniform_name.clear();
		this._found_param_texture_by_id.clear();
		this._found_param_textures_id_by_uniform_name.clear();
		const uniforms = material.uniforms;
		if (uniforms) {
			const uniformNames = Object.keys(uniforms);
			for (let uniformName of uniformNames) {
				const value = uniforms[uniformName].value;
				if (value && value.uuid) {
					const texture = value as Texture;
					this._found_uniform_texture_by_id.set(texture.uuid, value);
					this._found_uniform_textures_id_by_uniform_name.set(uniformName, texture.uuid);
					uniforms[uniformName].value = null;
				}
			}
		}
		const matPropertyNames = Object.keys(material) as Array<keyof Material>;
		for (let matPropertyName of matPropertyNames) {
			const propertyValue = material[matPropertyName];
			if (propertyValue && propertyValue.uuid) {
				const texture = propertyValue;
				this._found_param_texture_by_id.set(texture.uuid, texture);
				this._found_param_textures_id_by_uniform_name.set(matPropertyName, texture.uuid);
				(material as any)[matPropertyName] = null;
			}
		}
	}
	private _reassignTextures(material: ShaderMaterial) {
		const uniform_names_needing_reassignment: string[] = [];
		const param_names_needing_reassignment: string[] = [];
		this._found_uniform_textures_id_by_uniform_name.forEach((texture_id, name) => {
			uniform_names_needing_reassignment.push(name);
		});
		this._found_param_textures_id_by_uniform_name.forEach((texture_id, name) => {
			param_names_needing_reassignment.push(name);
		});
		const uniforms = material.uniforms;
		if (uniforms) {
			for (let name of uniform_names_needing_reassignment) {
				const texture_id = this._found_uniform_textures_id_by_uniform_name.get(name);
				if (texture_id) {
					const texture = this._found_uniform_texture_by_id.get(texture_id);
					if (texture) {
						uniforms[name].value = texture;
					}
				}
			}
		}
		for (let name of param_names_needing_reassignment) {
			const texture_id = this._found_param_textures_id_by_uniform_name.get(name);
			if (texture_id) {
				const texture = this._found_param_texture_by_id.get(texture_id);
				if (texture) {
					(material as any)[name] = texture;
				}
			}
		}
	}

	//
	//
	// LOAD MAT
	//
	//
	protected _loadMaterial(data: MaterialData): ShaderMaterialWithCustomMaterials | undefined {
		// hack fix for properties that are assumed to be on normal materials
		// but are not on ShaderMaterial
		data.color = undefined;

		const loader = new MaterialLoader();
		const material = loader.parse(data) as ShaderMaterialWithCustomMaterials;
		// TODO: wait for https://github.com/mrdoob/three.js/pull/21428
		// to be merged
		if ((data as any).shadowSide) {
			material.shadowSide = (data as any).shadowSide;
		}

		// TODO: compensates for lights not being saved (and therefore cannot be loaded correctly)
		if (data.lights != null) {
			material.lights = data.lights;
		}

		const uniforms = material.uniforms;
		if (uniforms) {
			// fix matrix that may be loaded as a mat4 instead of a mat3
			const uv2Transform = uniforms.uv2Transform;
			if (uv2Transform) {
				this.mat4ToMat3(uv2Transform);
			}
			const uvTransform = uniforms.uvTransform;
			if (uvTransform) {
				this.mat4ToMat3(uvTransform);
			}
		}
		return material as ShaderMaterialWithCustomMaterials;
	}
	private mat4ToMat3(uniform: IUniform) {
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
}
