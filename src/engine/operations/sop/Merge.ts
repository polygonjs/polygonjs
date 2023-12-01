import {BaseSopOperation} from './_Base';
import {Group, Material, Mesh} from 'three';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {MapUtils} from '../../../core/MapUtils';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObjectType, MergeCompactOptions, ObjectContent} from '../../../core/geometry/ObjectContent';
import {coreObjectClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {setToArray} from '../../../core/SetUtils';
import {NodeErrorState} from '../../nodes/utils/states/Error';
import {NodeContext} from '../../poly/NodeContext';

interface PreserveMaterialOptions {
	preserveMaterials: boolean;
}
interface MergeSopParams extends PreserveMaterialOptions, DefaultOperationParams {
	compact: boolean;
}

export class MergeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MergeSopParams = {
		compact: false,
		preserveMaterials: true,
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
		for (const inputCoreGroup of inputCoreGroups) {
			if (inputCoreGroup) {
				const objects = inputCoreGroup.allObjects();
				if (isBooleanTrue(params.compact)) {
					for (const object of objects) {
						object.traverse((child) => {
							allObjects.push(child as Object3DWithGeometry);
						});
					}
				} else {
					// if we are not compact,
					// we only use the current level, not children
					for (const object of objects) {
						allObjects.push(object);
					}
				}
			}
		}
		if (isBooleanTrue(params.compact)) {
			allObjects = MergeSopOperation.makeCompact(allObjects, params, this.states?.error);
		}

		return this.createCoreGroupFromObjects(allObjects);
	}
	static makeCompact(
		allObjects: ObjectContent<CoreObjectType>[],
		options: PreserveMaterialOptions,
		errorState?: NodeErrorState<NodeContext>
	): ObjectContent<CoreObjectType>[] {
		const {preserveMaterials} = options;
		const materialsByObjectType: Map<string, Material> = new Map();
		const objectsByType: Map<string, ObjectContent<CoreObjectType>[]> = new Map();
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
						const foundMat = materialsByObjectType.get(objectType);
						if (!foundMat) {
							materialsByObjectType.set(objectType, (object as Mesh).material as Material);
						}
						MapUtils.pushOnArrayAtEntry(objectsByType, objectType, object);
					}
				}
			});
		}
		const mergedObjects: ObjectContent<CoreObjectType>[] = [];
		orderedObjectTypes.forEach((objectType) => {
			const material = materialsByObjectType.get(objectType);

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

				if (isBooleanTrue(preserveMaterials)) {
					_makeCompactWithPreservedMaterials({
						objects,
						material,
						objectType,
						mergedObjects,
						onError: (message) => {
							errorState?.set(message);
						},
					});
				} else {
					const coreObjectClass = coreObjectClassFactory(objects[0]);
					coreObjectClass.mergeCompact({
						objects,
						material,
						objectType,
						mergedObjects,
						onError: (message) => {
							errorState?.set(message);
						},
					});
				}
			}
		});

		return mergedObjects;
	}
}

const objectsByMaterial: Map<Material, Set<ObjectContent<CoreObjectType>>> = new Map();
function _makeCompactWithPreservedMaterials(options: MergeCompactOptions) {
	const {objects, objectType, mergedObjects, onError} = options;
	const coreObjectClass = coreObjectClassFactory(objects[0]);
	objectsByMaterial.clear();
	for (let object of objects) {
		MapUtils.addToSetAtEntry(objectsByMaterial, object.material, object);
	}
	objectsByMaterial.forEach((objectSet, material) => {
		coreObjectClass.mergeCompact({
			objects: setToArray(objectSet, []),
			material,
			objectType,
			mergedObjects,
			onError,
		});
	});
}
