import lodash_isArray from 'lodash/isArray'

import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {Object3D} from 'three/src/core/Object3D'
import {Material} from 'three/src/materials/Material'
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial'
import {PolyScene} from 'src/engine/scene/PolyScene'

enum CustomMaterialName {
	customDistanceMaterial = 'customDistanceMaterial',
	customDepthMaterial = 'customDepthMaterial',
	customDepthDOFMaterial = 'customDepthDOFMaterial',
}
interface ObjectWithCustomMaterial extends Object3D {
	customDistanceMaterial: ShaderMaterial
	customDepthMaterial: ShaderMaterial
	customDepthDOFMaterial: ShaderMaterial
}
export interface ShaderMaterialWithCustomMaterials extends ShaderMaterial {
	custom_materials: {
		[key in CustomMaterialName]: ShaderMaterial
	}
}

export class CoreMaterial {
	static node(scene: PolyScene, material: Material) {
		return scene.node(material.name)
	}

	static clone(src_material: Material | Material[]) {
		if (lodash_isArray(src_material)) {
			return src_material.map((material) => {
				return this.clone_single(material)
			})
		} else {
			return this.clone_single(src_material)
		}
	}

	static clone_single(src_material: Material) {
		const material = src_material.clone()
			// linewidth doesn't seem cloned correctly for ShaderMaterial
		;(material as LineBasicMaterial).linewidth = (src_material as LineBasicMaterial).linewidth

		return material
	}

	static apply_custom_materials(
		object: Object3D,
		material: ShaderMaterialWithCustomMaterials
	) {
		if (material.custom_materials) {
			for (let name of Object.keys(material.custom_materials)) {
				const mat_name = name as CustomMaterialName
				// http://blog.edankwan.com/post/three-js-advanced-tips-shadow
				const custom_material = material.custom_materials[mat_name]
				;(object as ObjectWithCustomMaterial)[
					mat_name
				] = custom_material
				custom_material.needsUpdate = true
			}
			// object.material = material.custom_materials.customDepthDOFMaterial
			// object.material = material.custom_materials.customDepthMaterial
			// object.material = material.custom_materials.customDistanceMaterial
		}
	}
	static assign_custom_uniforms(
		material: ShaderMaterialWithCustomMaterials,
		uniform_name: string,
		uniform_value: any
	) {
		if (material.custom_materials) {
			for (let name of Object.keys(material.custom_materials)) {
				const mat_name = name as CustomMaterialName
				const custom_material = material.custom_materials[mat_name]
				custom_material.uniforms[uniform_name].value = uniform_value
			}
		}
	}
	static init_custom_material_uniforms(
		material: ShaderMaterialWithCustomMaterials,
		uniform_name: string,
		uniform_value: any
	) {
		if (material.custom_materials) {
			for (let name of Object.keys(material.custom_materials)) {
				const mat_name = name as CustomMaterialName
				const custom_material = material.custom_materials[mat_name]
				custom_material.uniforms[uniform_name] =
					custom_material.uniforms[uniform_name] || uniform_value
			}
		}
	}
}
