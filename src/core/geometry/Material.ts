import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {PolyScene} from '../../engine/scene/PolyScene';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
export interface IUniforms {
	[uniform: string]: IUniform;
}
export interface MaterialWithUniforms extends Material {
	uniforms: IUniforms;
}

export enum CustomMaterialName {
	customDistanceMaterial = 'customDistanceMaterial',
	customDepthMaterial = 'customDepthMaterial',
	customDepthDOFMaterial = 'customDepthDOFMaterial',
}

export interface ObjectWithCustomMaterials extends Mesh {
	// customDistanceMaterial?: Material;
	// customDepthMaterial?: Material;
	customDepthDOFMaterial?: Material;
}
export interface MaterialWithCustomMaterials extends Material {
	customMaterials: {
		[key in CustomMaterialName]?: Material;
	};
}
export interface ShaderMaterialWithCustomMaterials extends ShaderMaterial {
	customMaterials: {
		[key in CustomMaterialName]?: Material;
	};
}
export interface MaterialWithSkinning extends Material {
	skinning: boolean;
	morphTargets: boolean;
}

import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Geometry} from '../../modules/three/examples/jsm/deprecated/Geometry';
import {Group} from 'three/src/objects/Group';
import {ShaderAssemblerMaterial} from '../../engine/nodes/gl/code/assemblers/materials/_BaseMaterial';
import {assignUniformViaUserData} from '../../engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {IUniformTexture} from '../../engine/nodes/utils/code/gl/Uniforms';

export type RenderHook = (
	renderer: WebGLRenderer,
	scene: Scene,
	camera: Camera,
	geometry: BufferGeometry | Geometry,
	material: Material,
	group: Group | null // it's only 'Group', and not 'Group|null' in threejs types, but got null sometimes
) => void;
export type RenderHookWithObject = (
	renderer: WebGLRenderer,
	scene: Scene,
	camera: Camera,
	geometry: BufferGeometry | Geometry,
	material: Material,
	group: Group | null, // it's only 'Group', and not 'Group|null' in threejs types, but got null sometimes
	object: Object3D
) => void;
const RENDER_HOOK_USER_DATA_KEY = 'POLY_render_hook';

interface MaterialWithRenderHook {
	userData: {
		[RENDER_HOOK_USER_DATA_KEY]: RenderHookWithObject;
	};
}

const EMPTY_RENDER_HOOK: RenderHook = (
	renderer: WebGLRenderer,
	scene: Scene,
	camera: Camera,
	geometry: BufferGeometry | Geometry,
	material: Material,
	group: Group | null
) => {};

export class CoreMaterial {
	static node(scene: PolyScene, material: Material) {
		return scene.node(material.name);
	}

	static clone(src_material: Material | ShaderMaterial) {
		const cloned_material = src_material.clone();
		const src_uniforms = (src_material as ShaderMaterial).uniforms;
		if (src_uniforms) {
			(cloned_material as ShaderMaterial).uniforms = UniformsUtils.clone(src_uniforms);
		}
		return cloned_material;
	}

	// static clone_single(src_material: Material) {
	// 	const material = src_material.clone();
	// 	// linewidth doesn't seem cloned correctly for ShaderMaterial
	// 	(material as LineBasicMaterial).linewidth = (src_material as LineBasicMaterial).linewidth;

	// 	return material;
	// }

	static add_user_data_render_hook(material: Material, render_hook: RenderHookWithObject) {
		material.userData[RENDER_HOOK_USER_DATA_KEY] = render_hook;
	}

	static apply_render_hook(object: Object3D, material: MaterialWithRenderHook) {
		if (material.userData) {
			const render_hook: RenderHookWithObject = material.userData[RENDER_HOOK_USER_DATA_KEY];
			if (render_hook) {
				object.onBeforeRender = (
					renderer: WebGLRenderer,
					scene: Scene,
					camera: Camera,
					geometry: BufferGeometry | Geometry,
					material: Material,
					group: Group | null
				) => {
					render_hook(renderer, scene, camera, geometry, material, group, object);
				};
				return;
			}
		}
		// make sure to reset the render hook if apply to a material that does not have any
		object.onBeforeRender = EMPTY_RENDER_HOOK;
	}

	static applyCustomMaterials(object: Object3D, material: Material) {
		const material_with_custom = material as MaterialWithCustomMaterials;
		if (material_with_custom.customMaterials) {
			for (let name of Object.keys(material_with_custom.customMaterials)) {
				const mat_name = name as CustomMaterialName;
				// http://blog.edankwan.com/post/three-js-advanced-tips-shadow
				const custom_material = material_with_custom.customMaterials[mat_name];
				if (custom_material) {
					(object as ObjectWithCustomMaterials)[mat_name] = custom_material;
					custom_material.needsUpdate = true;
				}
			}
			// object.material = material.customMaterials.customDepthDOFMaterial
			// object.material = material.customMaterials.customDepthMaterial
			// object.material = material.customMaterials.customDistanceMaterial
		}
	}
	static assignUniforms(
		mat: Material,
		uniformName: string,
		uniform: IUniformTexture,
		assembler?: ShaderAssemblerMaterial
	) {
		assignUniformViaUserData(mat, uniformName, uniform);
		if (assembler) {
			this.assignUniformForOnBeforeCompile(mat, uniformName, uniform, assembler);
		}
	}
	// static assignCustomUniforms(
	// 	assembler: ShaderAssemblerMaterial,
	// 	mat: Material,
	// 	uniformName: string,
	// 	uniform: IUniform
	// ) {
	// 	const material = mat as MaterialWithCustomMaterials;
	// 	if (material.customMaterials) {
	// 		const matNames = Object.keys(material.customMaterials) as Array<CustomMaterialName>;
	// 		for (let matName of matNames) {
	// 			const customMaterial = material.customMaterials[matName];
	// 			if (customMaterial) {
	// 				this.assignUniforms(assembler, customMaterial, uniformName, uniform);
	// 				// const customShaderMaterial = customMaterial as ShaderMaterial;
	// 				// if (customShaderMaterial.uniforms) {
	// 				// 	customShaderMaterial.uniforms[uniformName].value = uniformValue;
	// 				// }
	// 			}
	// 		}
	// 	}
	// }
	static assignUniformForOnBeforeCompile(
		mat: Material,
		uniformName: string,
		uniform: IUniformTexture,
		assembler: ShaderAssemblerMaterial
	) {
		assembler.addAdditionalTextureUniforms(uniformName, uniform);
	}

	// static initCustomMaterialUniforms(mat: Material, uniformName: string, uniformValue: any) {
	// 	const material = mat as MaterialWithCustomMaterials;
	// 	if (material.customMaterials) {
	// 		for (let name of Object.keys(material.customMaterials)) {
	// 			const mat_name = name as CustomMaterialName;
	// 			const customMaterial = material.customMaterials[mat_name];
	// 			if (customMaterial) {
	// 				const customShaderMaterial = customMaterial as ShaderMaterial;
	// 				if (customShaderMaterial.uniforms) {
	// 					customShaderMaterial.uniforms[uniformName] =
	// 						customShaderMaterial.uniforms[uniformName] || uniformValue;
	// 				}
	// 			}
	// 		}
	// 	}
	// }
}
