import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {ObjectType, objectTypeFromConstructor} from '../../../core/geometry/Constant';
import {Material} from 'three';
import {MapUtils} from '../../../core/MapUtils';
import {Object3D} from 'three';
import {Group} from 'three';
import {Mesh} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BufferGeometry} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreGeometryBuilderMerge} from '../../../core/geometry/builders/Merge';

interface MergeSopParams extends DefaultOperationParams {
	compact: boolean;
}

export class MergeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MergeSopParams = {
		compact: false,
		keepHierarchy: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'merge'> {
		return 'merge';
	}

	// TODO: improvement:
	// for compact, I should really keep track of geometry ids,
	// to make sure I am not including a geometry twice, if there is a hierarchy
	override cook(inputCoreGroups: CoreGroup[], params: MergeSopParams) {
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
		const materialsByObjectType: Map<ObjectType, Material> = new Map();
		const objectsByType: Map<ObjectType, Object3DWithGeometry[]> = new Map();
		// objects_by_type.set(ObjectType.MESH, []);
		// objects_by_type.set(ObjectType.POINTS, []);
		// objects_by_type.set(ObjectType.LINE_SEGMENTS, []);
		const orderedObjectTypes: ObjectType[] = [];

		for (let object of all_objects) {
			object.traverse((object3d: Object3D) => {
				if (object3d instanceof Group) {
					// we do not want groups,
					// as their children will end up being duplicated
					return;
				}
				const object = object3d as Object3DWithGeometry;
				if (object.geometry) {
					const objectType = objectTypeFromConstructor(object.constructor);
					if (objectType) {
						if (!orderedObjectTypes.includes(objectType)) {
							orderedObjectTypes.push(objectType);
						}
						if (objectType) {
							const found_mat = materialsByObjectType.get(objectType);
							if (!found_mat) {
								materialsByObjectType.set(objectType, (object as Mesh).material as Material);
							}
							MapUtils.pushOnArrayAtEntry(objectsByType, objectType, object);
						}
					}
				}
			});
		}
		const mergedObjects: Object3DWithGeometry[] = [];
		orderedObjectTypes.forEach((objectType) => {
			const objects = objectsByType.get(objectType);
			if (objects) {
				const geometries: BufferGeometry[] = [];
				for (let object of objects) {
					const geometry = object.geometry;
					geometry.applyMatrix4(object.matrix);
					geometries.push(geometry);
				}

				// TODO: test that this works with geometries with same attributes
				try {
					const merged_geometry = CoreGeometryBuilderMerge.merge(geometries);
					if (merged_geometry) {
						const material = materialsByObjectType.get(objectType);
						const object = this.createObject(merged_geometry, objectType, material);
						object.matrixAutoUpdate = false;
						mergedObjects.push(object as Object3DWithGeometry);
					} else {
						this.states?.error.set('merge failed, check that input geometries have the same attributes');
					}
				} catch (e) {
					this.states?.error.set((e as Error).message);
				}
			}
		});

		return mergedObjects;
	}
}
