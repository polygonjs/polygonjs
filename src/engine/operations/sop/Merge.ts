import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {ObjectType, objectTypeFromConstructor} from '../../../core/geometry/Constant';
import {Material} from 'three/src/materials/Material';
import {MapUtils} from '../../../core/MapUtils';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {Object3D} from 'three/src/core/Object3D';
import {Group} from 'three/src/objects/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

interface MergeSopParams extends DefaultOperationParams {
	compact: boolean;
}

export class MergeSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: MergeSopParams = {
		compact: false,
		keepHierarchy: false,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'merge'> {
		return 'merge';
	}

	// TODO: improvement:
	// for compact, I should really keep track of geometry ids,
	// to make sure I am not including a geometry twice, if there is a hierarchy
	cook(inputCoreGroups: CoreGroup[], params: MergeSopParams) {
		let allObjects: Object3D[] = [];
		for (let inputCoreGroup of inputCoreGroups) {
			if (inputCoreGroup) {
				const objects = inputCoreGroup.objects();
				if (isBooleanTrue(params.compact)) {
					for (let object of objects) {
						object.traverse((child) => {
							allObjects.push(child as Object3DWithGeometry);
						});
					}
				} else {
					// if we are not compact,
					// we only use the current level, not children
					for (let object of inputCoreGroup.objects()) {
						allObjects.push(object);
					}
				}
			}
		}
		if (isBooleanTrue(params.compact)) {
			allObjects = this._makeCompact(allObjects);
		}
		return this.createCoreGroupFromObjects(allObjects);
	}
	private _makeCompact(all_objects: Object3D[]): Object3DWithGeometry[] {
		const materials_by_object_type: Map<ObjectType, Material> = new Map();
		const objects_by_type: Map<ObjectType, Object3DWithGeometry[]> = new Map();
		// objects_by_type.set(ObjectType.MESH, []);
		// objects_by_type.set(ObjectType.POINTS, []);
		// objects_by_type.set(ObjectType.LINE_SEGMENTS, []);
		const ordered_object_types: ObjectType[] = [];

		for (let object of all_objects) {
			object.traverse((object3d: Object3D) => {
				if (object3d instanceof Group) {
					// we do not want groups,
					// as their children will end up being duplicated
					return;
				}
				const object = object3d as Object3DWithGeometry;
				if (object.geometry) {
					const object_type = objectTypeFromConstructor(object.constructor);
					if (!ordered_object_types.includes(object_type)) {
						ordered_object_types.push(object_type);
					}
					if (object_type) {
						const found_mat = materials_by_object_type.get(object_type);
						if (!found_mat) {
							materials_by_object_type.set(object_type, (object as Mesh).material as Material);
						}
						MapUtils.pushOnArrayAtEntry(objects_by_type, object_type, object);
					}
				}
			});
		}
		const merged_objects: Object3DWithGeometry[] = [];
		ordered_object_types.forEach((object_type) => {
			const objects = objects_by_type.get(object_type);
			if (objects) {
				const geometries: BufferGeometry[] = [];
				for (let object of objects) {
					const geometry = object.geometry;
					geometry.applyMatrix4(object.matrix);
					geometries.push(geometry);
				}

				// TODO: test that this works with geometries with same attributes
				try {
					const merged_geometry = CoreGeometry.mergeGeometries(geometries);
					if (merged_geometry) {
						const material = materials_by_object_type.get(object_type);
						const object = this.createObject(merged_geometry, object_type, material);
						object.matrixAutoUpdate = false;
						merged_objects.push(object as Object3DWithGeometry);
					} else {
						this.states?.error.set('merge failed, check that input geometries have the same attributes');
					}
				} catch (e) {
					this.states?.error.set((e as Error).message);
				}
			}
		});

		return merged_objects;
	}
}
