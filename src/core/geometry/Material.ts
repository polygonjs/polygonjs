import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {PolyScene} from '../../engine/scene/PolyScene';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

export interface IUniforms {
	[uniform: string]: IUniform;
}
export interface MaterialWithUniforms extends Material {
	uniforms: IUniforms;
}

enum CustomMaterialName {
	customDistanceMaterial = 'customDistanceMaterial',
	customDepthMaterial = 'customDepthMaterial',
	customDepthDOFMaterial = 'customDepthDOFMaterial',
}
export interface ObjectWithCustomMaterials extends Mesh {
	// customDistanceMaterial?: Material;
	// customDepthMaterial?: Material;
	customDepthDOFMaterial?: Material;
}
export interface ShaderMaterialWithCustomMaterials extends ShaderMaterial {
	custom_materials: {
		[key in CustomMaterialName]?: ShaderMaterial;
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
import {Geometry} from 'three/src/core/Geometry';
import {Group} from 'three/src/objects/Group';

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

	// static clone(src_material: Material | Material[]) {
	// 	if (lodash_isArray(src_material)) {
	// 		return src_material.map((material) => {
	// 			return this.clone_single(material);
	// 		});
	// 	} else {
	// 		return this.clone_single(src_material);
	// 	}
	// }

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

	static apply_custom_materials(object: Object3D, material: Material) {
		const material_with_custom = material as ShaderMaterialWithCustomMaterials;
		if (material_with_custom.custom_materials) {
			for (let name of Object.keys(material_with_custom.custom_materials)) {
				const mat_name = name as CustomMaterialName;
				// http://blog.edankwan.com/post/three-js-advanced-tips-shadow
				const custom_material = material_with_custom.custom_materials[mat_name];
				if (custom_material) {
					(object as ObjectWithCustomMaterials)[mat_name] = custom_material;
					custom_material.needsUpdate = true;
				}
			}
			// object.material = material.custom_materials.customDepthDOFMaterial
			// object.material = material.custom_materials.customDepthMaterial
			// object.material = material.custom_materials.customDistanceMaterial
		}
	}
	static assign_custom_uniforms(mat: Material, uniform_name: string, uniform_value: any) {
		const material = mat as ShaderMaterialWithCustomMaterials;
		if (material.custom_materials) {
			for (let name of Object.keys(material.custom_materials)) {
				const mat_name = name as CustomMaterialName;
				const custom_material = material.custom_materials[mat_name];
				if (custom_material) {
					custom_material.uniforms[uniform_name].value = uniform_value;
				}
			}
		}
	}
	static init_custom_material_uniforms(mat: Material, uniform_name: string, uniform_value: any) {
		const material = mat as ShaderMaterialWithCustomMaterials;
		if (material.custom_materials) {
			for (let name of Object.keys(material.custom_materials)) {
				const mat_name = name as CustomMaterialName;
				const custom_material = material.custom_materials[mat_name];
				if (custom_material) {
					custom_material.uniforms[uniform_name] = custom_material.uniforms[uniform_name] || uniform_value;
				}
			}
		}
	}
}
