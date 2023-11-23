import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {QuadObject} from './QuadObject';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {CoreObjectType, MergeCompactOptions, ObjectContent, objectContentCopyProperties} from '../../ObjectContent';
import {TransformTargetType} from '../../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import {QuadPrimitive} from './QuadPrimitive';
import {quadGeomeryMerge} from './builders/QuadGeometryMerge';
import {objectData} from '../../entities/object/BaseCoreObjectUtils';
import {QuadPoint} from './QuadPoint';
import {QuadVertex} from './QuadVertex';
import {AttribClass, ObjectData} from '../../Constant';
import {TraversedRelatedEntityData} from '../../entities/utils/TraversedRelatedEntities';
import {CoreEntityWithObject} from '../../CoreEntity';
import {arrayCopy} from '../../../ArrayUtils';

const _box = new Box3();
export class QuadCoreObject extends BaseCoreObject<CoreObjectType.QUAD> {
	protected override _object: QuadObject;
	constructor(_object: QuadObject, index: number) {
		super(_object, index);
		this._object = _object;
	}
	static override position(object: QuadObject, target: Vector3) {
		object.boundingBox(_box);
		_box.getCenter(target);
	}
	override boundingBox(target: Box3) {
		this._object.boundingBox(target);
	}
	override boundingSphere(target: Sphere) {
		this._object.boundingSphere(target);
	}
	static override objectData<T extends CoreObjectType>(object: ObjectContent<T>): ObjectData {
		const data = objectData(object);

		data.pointsCount = QuadPoint.entitiesCount(object);
		data.verticesCount = QuadVertex.entitiesCount(object);
		data.primitivesCount = QuadPrimitive.entitiesCount(object);
		data.primitiveName = 'quad';

		return data;
	}

	static override applyMatrix(
		object: QuadObject,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace,
		transformMode: ObjectTransformMode
	) {
		object.applyMatrix4(matrix);
	}
	static override mergeCompact(options: MergeCompactOptions) {
		const {objects, mergedObjects, onError} = options;
		const firstObject = objects[0];
		if (!firstObject) {
			return;
		}

		const quadObjects = objects as QuadObject[];

		try {
			const mergedGeometry = quadGeomeryMerge(quadObjects);
			if (mergedGeometry) {
				const newObject = new QuadObject(mergedGeometry);
				objectContentCopyProperties(firstObject, newObject);
				mergedObjects.push(newObject as QuadObject);
			} else {
				onError('merge failed, check that input geometries have the same attributes');
			}
		} catch (e) {
			onError((e as Error).message || 'unknown error');
		}
	}
	//
	//
	// RELATED ENTITIES
	//
	//
	static override relatedPrimitiveIds(
		object: ObjectContent<CoreObjectType>,
		index: number,
		target: number[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		const count = QuadPrimitive.entitiesCount(object as any as QuadObject);
		target.length = count;
		for (let i = 0; i < count; i++) {
			target[i] = i;
		}
		if (traversedRelatedEntityData && traversedRelatedEntityData[AttribClass.PRIMITIVE].ids != target) {
			arrayCopy(target, traversedRelatedEntityData[AttribClass.PRIMITIVE].ids);
		}
	}

	static override relatedPrimitiveClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return QuadPrimitive as any as typeof CoreEntityWithObject<T>;
	}
}
