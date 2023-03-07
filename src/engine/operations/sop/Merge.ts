import {BaseSopOperation} from './_Base';
import {Group, Material, Mesh} from 'three';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {MapUtils} from '../../../core/MapUtils';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {coreObjectFactory} from '../../../core/geometry/CoreObjectFactory';

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
		let allObjects: ObjectContent<CoreObjectType>[] = [];
		for (let inputCoreGroup of inputCoreGroups) {
			if (inputCoreGroup) {
				const objects = inputCoreGroup.allObjects();
				if (isBooleanTrue(params.compact)) {
					for (let object of objects) {
						object.traverse((child) => {
							allObjects.push(child as Object3DWithGeometry);
						});
					}
				} else {
					// if we are not compact,
					// we only use the current level, not children
					for (let object of inputCoreGroup.allObjects()) {
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
	private _makeCompact(allObjects: ObjectContent<CoreObjectType>[]): ObjectContent<CoreObjectType>[] {
		const materialsByObjectType: Map<string, Material> = new Map();
		const objectsByType: Map<string, ObjectContent<CoreObjectType>[]> = new Map();
		// objects_by_type.set(ObjectType.MESH, []);
		// objects_by_type.set(ObjectType.POINTS, []);
		// objects_by_type.set(ObjectType.LINE_SEGMENTS, []);
		const orderedObjectTypes: string[] = [];
		for (let object of allObjects) {
			object.traverse((object3d) => {
				if (object3d instanceof Group) {
					// we do not want groups,
					// as their children will end up being duplicated
					return;
				}
				const objectType: string | undefined = object.type; //objectTypeFromConstructor(object.constructor);
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
			});
		}
		const mergedObjects: ObjectContent<CoreObjectType>[] = [];
		orderedObjectTypes.forEach((objectType) => {
			const objects = objectsByType.get(objectType);
			if (objects && objects.length != 0) {
				// even with just 1 geometry,
				// we should still perform the merge,
				// to make sure the output is consistent.
				// The main discrepency notices is that if not merged,
				// any non-identity matrix will be preserved, when it should not
				// if (objects.length == 1) {
				// 	mergedObjects.push(objects[0]);
				// } else {
				const coreObjectClass = coreObjectFactory(objects[0]);
				coreObjectClass.mergeCompact({
					objects,
					materialsByObjectType,
					objectType,
					mergedObjects,
					onError: (message) => {
						this._node?.states.error.set(message);
					},
				});
				// }
			}
		});

		return mergedObjects;
	}
}
