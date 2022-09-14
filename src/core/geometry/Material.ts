import {ShaderMaterial} from 'three';
import {Object3D} from 'three';
import {Mesh} from 'three';
import {Material} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {IUniform} from 'three';
import {UniformsUtils} from 'three';
export interface IUniforms {
	[uniform: string]: IUniform;
}
export interface MaterialWithUniforms extends Material {
	uniforms: IUniforms;
}

export enum CustomMaterialName {
	DISTANCE = 'customDistanceMaterial', // for point lights
	DEPTH = 'customDepthMaterial', // for spot lights and directional
	DEPTH_DOF = 'customDepthDOFMaterial', // for post/bokeh only (see in scene.)
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

import {WebGLRenderer} from 'three';
import {Scene} from 'three';
import {Camera} from 'three';
import {BufferGeometry} from 'three';
import {Group} from 'three';
import {ShaderAssemblerMaterial} from '../../engine/nodes/gl/code/assemblers/materials/_BaseMaterial';
import {
	assignUniformViaUserData,
	copyOnBeforeCompileData,
} from '../../engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {IUniformTexture} from '../../engine/nodes/utils/code/gl/Uniforms';

export type RenderHook = (
	renderer: WebGLRenderer,
	scene: Scene,
	camera: Camera,
	geometry: BufferGeometry,
	material: Material,
	group: Group | null // it's only 'Group', and not 'Group|null' in threejs types, but got null sometimes
) => void;
export type RenderHookWithObject = (
	renderer: WebGLRenderer,
	scene: Scene,
	camera: Camera,
	geometry: BufferGeometry,
	material: Material,
	group: Group | null, // it's only 'Group', and not 'Group|null' in threejs types, but got null sometimes
	object: Object3D
) => void;
const RENDER_HOOK_USER_DATA_KEY = 'POLY_render_hook';

interface MaterialWithRenderHook extends Material {
	userData: {
		[RENDER_HOOK_USER_DATA_KEY]: RenderHookWithObject;
	};
}

const EMPTY_RENDER_HOOK: RenderHook = (
	renderer: WebGLRenderer,
	scene: Scene,
	camera: Camera,
	geometry: BufferGeometry,
	material: Material,
	group: Group | null
) => {};

interface CloneOptions {
	shareCustomUniforms: boolean;
}
export class CoreMaterial {
	static node(scene: PolyScene, material: Material) {
		return scene.node(material.name);
	}

	static clone(scene: PolyScene, srcMaterial: Material | ShaderMaterial, options: CloneOptions) {
		const clonedMaterial = srcMaterial.clone();
		const srcUniforms = (srcMaterial as ShaderMaterial).uniforms;
		if (srcUniforms) {
			(clonedMaterial as ShaderMaterial).uniforms = UniformsUtils.clone(srcUniforms);
		}
		copyOnBeforeCompileData(scene, {
			src: srcMaterial,
			dest: clonedMaterial,
			shareCustomUniforms: options.shareCustomUniforms,
		});
		return clonedMaterial;
	}

	// static clone_single(src_material: Material) {
	// 	const material = src_material.clone();
	// 	// linewidth doesn't seem cloned correctly for ShaderMaterial
	// 	(material as LineBasicMaterial).linewidth = (src_material as LineBasicMaterial).linewidth;

	// 	return material;
	// }

	/*
	//
	// TODO:
	// this render hook system has a big limitation,
	// which is that if we clone the object, it may not be propagated correctly,
	// since this is assigned at render time.
	// This means that if we clone an object before it has been rendered,
	// it won't have the onBeforeRender function, and therefore won't pass it on to its clone.
	//
	*/
	static addUserDataRenderHook(material: Material, renderHook: RenderHookWithObject) {
		material.userData[RENDER_HOOK_USER_DATA_KEY] = renderHook;
	}

	static applyRenderHook(object: Object3D, material: MaterialWithRenderHook) {
		if (material.userData) {
			const renderHook: RenderHookWithObject = material.userData[RENDER_HOOK_USER_DATA_KEY];
			if (renderHook) {
				object.onBeforeRender = (
					renderer: WebGLRenderer,
					scene: Scene,
					camera: Camera,
					geometry: BufferGeometry,
					material: Material,
					group: Group | null
				) => {
					renderHook(renderer, scene, camera, geometry, material, group, object);
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
				const matName = name as CustomMaterialName;
				// http://blog.edankwan.com/post/three-js-advanced-tips-shadow
				const customMaterial = material_with_custom.customMaterials[matName];
				if (customMaterial) {
					(object as ObjectWithCustomMaterials)[matName] = customMaterial;
					customMaterial.needsUpdate = true;
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
