// import {Scene} from 'three';
// import {Mesh} from 'three';
// import {Material} from 'three';
// import {IUniform} from 'three';

// import {CoreGeometry} from './Geometry';
// import {MaterialWithUniforms} from './Material';

// import {ObjectWithCustomMaterials} from './Material';
// import {BufferGeometry} from 'three';
// import {Object3D} from 'three';

// interface Uniforms {
// 	[propName: string]: IUniform;
// }

// export class CoreScene {
// 	constructor(private _scene: Scene) {}

// 	scene() {
// 		return this._scene;
// 	}

// 	// private _originalMaterialByObjectId: Map<string, Material | Material[]> = new Map();
// 	// withOverridenMaterial(
// 	// 	baseMaterial: Material,
// 	// 	instanceMaterial: Material,
// 	// 	uniforms: Uniforms,
// 	// 	callback: () => void
// 	// ) {
// 	// 	let assignedMaterial: MaterialWithUniforms;

// 	// 	this._scene.traverse((object3d: Object3D) => {
// 	// 		const object = object3d as ObjectWithCustomMaterials;
// 	// 		if (object.material) {
// 	// 			const geometry = object.geometry as BufferGeometry;
// 	// 			if (geometry) {
// 	// 				const customDOPMaterial = object.customDepthDOFMaterial;
// 	// 				if (customDOPMaterial) {
// 	// 					assignedMaterial = customDOPMaterial as MaterialWithUniforms;
// 	// 					if (assignedMaterial.uniforms) {
// 	// 						for (let k of Object.keys(uniforms)) {
// 	// 							assignedMaterial.uniforms[k].value = uniforms[k].value;
// 	// 						}
// 	// 					}
// 	// 				} else {
// 	// 					if (CoreGeometry.markedAsInstance(geometry)) {
// 	// 						assignedMaterial = instanceMaterial as MaterialWithUniforms;
// 	// 					} else {
// 	// 						assignedMaterial = baseMaterial as MaterialWithUniforms;
// 	// 					}
// 	// 				}

// 	// 				if (assignedMaterial) {
// 	// 					this._originalMaterialByObjectId.set(object.uuid, object.material);
// 	// 					object.material = assignedMaterial;
// 	// 				}

// 	// 				// if( CoreGeometry.markedAsInstance(geometry) ){
// 	// 				// 	object.material = instance_material
// 	// 				// } else {
// 	// 				// 	object.material = base_material
// 	// 				// }
// 	// 			}
// 	// 		}
// 	// 	});

// 	// 	callback();

// 	// 	this._scene.traverse((object3d: Object3D) => {
// 	// 		const object = object3d as Mesh;
// 	// 		if (object.material) {
// 	// 			const geometry = object.geometry;
// 	// 			if (geometry) {
// 	// 				const mat = this._originalMaterialByObjectId.get(object.uuid);
// 	// 				if (mat) {
// 	// 					object.material = mat;
// 	// 				}
// 	// 			}
// 	// 		}
// 	// 	});

// 	// 	this._originalMaterialByObjectId.clear();
// 	// }
// }
