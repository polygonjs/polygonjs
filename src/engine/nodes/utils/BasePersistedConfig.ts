import {PolyDictionary} from '../../../types/GlobalTypes';
import {BaseNodeType} from '../_Base';
import {Texture} from 'three';
import {Matrix3} from 'three';
import {IUniform} from 'three';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {MaterialLoader} from 'three';
import {Material} from 'three';
import {ShaderMaterial} from 'three';
import {MaterialUserDataUniforms, OnBeforeCompileDataHandler} from '../gl/code/assemblers/materials/OnBeforeCompile';
import {MeshDepthMaterial} from 'three';
import {
	ShadowMaterial,
	SpriteMaterial,
	RawShaderMaterial,
	PointsMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	MeshToonMaterial,
	MeshNormalMaterial,
	MeshLambertMaterial,
	MeshDistanceMaterial,
	MeshBasicMaterial,
	MeshMatcapMaterial,
	LineDashedMaterial,
	LineBasicMaterial,
} from 'three';
import {VelocityColliderFunctionBody} from '../js/code/assemblers/_Base';

function MonkeyPatchMaterial() {
	const materialLib = {
		ShadowMaterial,
		SpriteMaterial,
		RawShaderMaterial,
		ShaderMaterial,
		PointsMaterial,
		MeshPhysicalMaterial,
		MeshStandardMaterial,
		MeshPhongMaterial,
		MeshToonMaterial,
		MeshNormalMaterial,
		MeshLambertMaterial,
		MeshDepthMaterial,
		MeshDistanceMaterial,
		MeshBasicMaterial,
		MeshMatcapMaterial,
		LineDashedMaterial,
		LineBasicMaterial,
		Material,
	};

	(Material as any).fromType = function (type: string) {
		return new (materialLib as any)[type]();
	};
}

interface MaterialData {
	color?: boolean;
	lights?: boolean;
}

interface ToJsonOptions {
	node: BaseNodeType;
	suffix: string;
}
interface DataObjectWithoutShaders {}
export interface PersistedConfigWithShaders extends DataObjectWithoutShaders {
	// when a particle system is saved without having been computed
	// it will not have shaders, and this can therefore be undefined
	shaders?: PolyDictionary<string>;
	functionBody?: string | VelocityColliderFunctionBody;
}
const ENTRY_NAMES_TO_REMOVE: Set<string> = new Set(['shaders', 'functionBody']);
export abstract class BasePersistedConfig {
	constructor(protected node: BaseNodeType) {}
	abstract toData(): Promise<PersistedConfigWithShaders | void>;
	load(data: object) {}

	async toDataWithoutShaders(): Promise<DataObjectWithoutShaders | void> {
		const data = await this.toData();
		if (!data) {
			return;
		}
		const dataWithoutShaders: DataObjectWithoutShaders = {};
		const entryNames = Object.keys(data);
		for (const entryName of entryNames) {
			if (!ENTRY_NAMES_TO_REMOVE.has(entryName)) {
				(dataWithoutShaders as any)[entryName] = (data as any)[entryName];
			}
		}
		return dataWithoutShaders;
	}

	//
	//
	// SAVE MAT
	//
	//
	protected _materialToJson(material: Material, options: ToJsonOptions): object | undefined {
		let material_data: object | undefined = undefined;
		this._withPreparedMaterial(material, () => {
			try {
				material_data = material.toJSON();
				if (material_data) {
					// those properties are currently not handled in three.js
					// TODO: wait for https://github.com/mrdoob/three.js/pull/21428
					// to be merged
					// (material_data as any).shadowSide = material.shadowSide;
					// (material_data as any).colorWrite = material.colorWrite;
					const depthPacking = (material as MeshDepthMaterial).depthPacking;
					(material_data as any).depthPacking = depthPacking;
				}
			} catch (err) {
				console.error('failed to save material data');
				console.log(material);
				console.log(err);
			}
			if (material_data && (material as ShaderMaterial).lights != null) {
				(material_data as any).lights = (material as ShaderMaterial).lights;
			}
			if (material_data) {
				// here we force the uuid to an expected value,
				// so that it does not get overriden at each load/save
				(material_data as any).uuid = `${options.node.path()}-${options.suffix}`;
			}
		});

		return material_data;
	}

	private _withPreparedMaterial(material: Material, callback: () => void) {
		this._withUnassignedUniformTextures(material as ShaderMaterial, () => {
			this._withUnassignedBasePropertyTextures(material, () => {
				this._withUnassignedOnBeforeCompileData(material, () => {
					callback();
				});
			});
		});
	}

	private _withUnassignedOnBeforeCompileData(material: Material, callback: () => void) {
		const uniforms = MaterialUserDataUniforms.removeUniforms(material);
		const onBeforeCompileData = OnBeforeCompileDataHandler.removeData(material);

		callback();

		if (uniforms) {
			MaterialUserDataUniforms.setUniforms(material, uniforms);
		}
		if (onBeforeCompileData) {
			OnBeforeCompileDataHandler.setData(material, onBeforeCompileData);
		}
	}
	private _withUnassignedUniformTextures(material: ShaderMaterial, callback: () => void) {
		const textureByUniformName: Map<string, Texture> = new Map();
		// we use material.uniforms and not material.userData.uniforms
		// since userData.uniforms are removed in ._unassignOnBeforeCompileUniforms
		const uniforms = (material as ShaderMaterial).uniforms;
		if (uniforms) {
			const uniformNames = Object.keys(uniforms);
			for (const uniformName of uniformNames) {
				const value = uniforms[uniformName].value;
				if (value && value.uuid) {
					const texture = value as Texture;
					textureByUniformName.set(uniformName, texture);
					uniforms[uniformName].value = null;
				}
			}
		}

		callback();

		if (uniforms) {
			textureByUniformName.forEach((texture, uniformName) => {
				uniforms[uniformName].value = texture;
			});
		}
	}
	private _withUnassignedBasePropertyTextures(material: Material, callback: () => void) {
		const textureByPropertyName: Map<string, Texture> = new Map();
		// we use material.uniforms and not material.userData.uniforms
		// since userData.uniforms are removed in ._unassignOnBeforeCompileUniforms
		const propertyNames = Object.keys(material);
		for (const propertyName of propertyNames) {
			const value = (material as any)[propertyName] as Texture | undefined;
			if (value && value.uuid && value instanceof Texture) {
				textureByPropertyName.set(propertyName, value);
				(material as any)[propertyName] = null;
			}
		}

		callback();

		textureByPropertyName.forEach((texture, uniformName) => {
			(material as any)[uniformName] = texture;
		});
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
		MonkeyPatchMaterial();
		const material = loader.parse(data) as ShaderMaterialWithCustomMaterials;
		// TODO: wait for https://github.com/mrdoob/three.js/pull/21428
		// to be merged
		// if ((data as any).shadowSide) {
		// 	material.shadowSide = (data as any).shadowSide;
		// }

		if ((data as any).depthPacking) {
			((<unknown>material) as MeshDepthMaterial).depthPacking = (data as any).depthPacking;
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
