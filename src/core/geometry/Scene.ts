import {Scene} from 'three/src/scenes/Scene';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

import {CoreGeometry} from './Geometry';

import {ObjectWithCustomMaterials} from './Material';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Object3D} from 'three/src/core/Object3D';

interface Uniforms {
	[propName: string]: IUniform;
}
interface MaterialsByString {
	[propName: string]: Material;
}

export class CoreScene {
	constructor(private _scene: Scene) {}

	scene() {
		return this._scene;
	}

	with_overriden_material(
		base_material: Material,
		instance_material: Material,
		uniforms: Uniforms,
		callback: () => void
	) {
		const original_material_by_object_id: MaterialsByString = {};
		let assigned_material;

		this._scene.traverse((object3d: Object3D) => {
			const object = object3d as ObjectWithCustomMaterials;
			if (object.material) {
				const geometry = object.geometry as BufferGeometry;
				if (geometry) {
					// console.log(object, object.custom_materials)
					const custom_dof_material = object.customDepthDOFMaterial;
					if (custom_dof_material) {
						assigned_material = custom_dof_material;
						for (let k of Object.keys(uniforms)) {
							assigned_material.uniforms[k].value = uniforms[k].value;
						}
					} else {
						if (CoreGeometry.marked_as_instance(geometry)) {
							assigned_material = instance_material;
						} else {
							assigned_material = base_material;
						}
					}

					if (assigned_material) {
						original_material_by_object_id[object.uuid] = object.material as Material;
						object.material = assigned_material;
					}

					// if( CoreGeometry.marked_as_instance(geometry) ){
					// 	object.material = instance_material
					// } else {
					// 	object.material = base_material
					// }
				}
			}
		});

		callback();

		this._scene.traverse((object3d: Object3D) => {
			const object = object3d as Mesh;
			if (object.material) {
				const geometry = object.geometry;
				if (geometry) {
					object.material = original_material_by_object_id[object.uuid];
				}
			}
		});

		for (let key of Object.keys(original_material_by_object_id)) {
			delete original_material_by_object_id[key];
		}
	}
}
