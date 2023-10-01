import {BufferGeometry, Material, Mesh, MeshDepthMaterial, Object3D, Scene} from 'three';
import {ObjectWithCustomMaterials} from '../../../core/geometry/Material';

const _originalMaterialByObjectId: Map<Mesh, Material | Material[]> = new Map();
const materialDepth = new MeshDepthMaterial();
export function updateObjectsWithDepthMaterial(scene: Scene, callback: () => void) {
	// let assignedMaterial: MaterialWithUniforms;
	// this._originalMaterialByObjectId.clear()

	scene.traverse((object3d: Object3D) => {
		const object = object3d as ObjectWithCustomMaterials;
		if (object.material) {
			const geometry = object.geometry as BufferGeometry;
			if (geometry) {
				const customMaterial = object.customDepthDOFMaterial || materialDepth;
				// if (customMaterial) {
				_originalMaterialByObjectId.set(object as Mesh, object.material);
				object.material = customMaterial;
				// assignedMaterial = customMaterial as MaterialWithUniforms;
				// if (assignedMaterial.uniforms) {
				// 	for (let k of Object.keys(uniforms)) {
				// 		assignedMaterial.uniforms[k].value = uniforms[k].value;
				// 	}
				// }
				// }
				// } else {
				// 	if (markedAsInstance(geometry)) {
				// 		assignedMaterial = instanceMaterial as MaterialWithUniforms;
				// 	} else {
				// 		assignedMaterial = baseMaterial as MaterialWithUniforms;
				// 	}
				// }

				// if (assignedMaterial) {
				// 	this._originalMaterialByObjectId.set(object.uuid, object.material);
				// 	object.material = assignedMaterial;
				// }

				// if( markedAsInstance(geometry) ){
				// 	object.material = instance_material
				// } else {
				// 	object.material = base_material
				// }
			}
		}
	});

	callback();

	_originalMaterialByObjectId.forEach((material, object) => {
		object.material = material;
	});

	// this._scene.traverse((object3d: Object3D) => {
	// 	const object = object3d as Mesh;
	// 	if (object.material) {
	// 		const geometry = object.geometry;
	// 		if (geometry) {
	// 			const mat = this._originalMaterialByObjectId.get(object.uuid);
	// 			if (mat) {
	// 				object.material = mat;
	// 			}
	// 		}
	// 	}
	// });

	_originalMaterialByObjectId.clear();
}

export function linearize(depth: number, near: number, far: number) {
	var zfar = far;
	var znear = near;
	return (-zfar * znear) / (depth * (zfar - znear) - zfar);
}

export function smoothstep(near: number, far: number, depth: number) {
	var x = saturate((depth - near) / (far - near));
	return x * x * (3 - 2 * x);
}

function saturate(x: number) {
	return Math.max(0, Math.min(1, x));
}
