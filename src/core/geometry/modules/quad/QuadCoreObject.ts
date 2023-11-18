import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {QuadObject} from './QuadObject';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {CoreObjectType, MergeCompactOptions, ObjectContent, objectContentCopyProperties} from '../../ObjectContent';
import {TransformTargetType} from '../../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import type {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {QuadPrimitive} from './QuadPrimitive';
import {quadGeomeryMerge} from './builders/QuadGeometryMerge';
import {objectData} from '../../entities/object/BaseCoreObjectUtils';
import {QuadPoint} from './QuadPoint';
import {QuadVertex} from './QuadVertex';
import {ObjectData} from '../../Constant';

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
	override relatedPrimitives(target: CorePrimitive<CoreObjectType>[]): void {
		const primitivesCount = QuadPrimitive.entitiesCount(this._object);
		target.length = primitivesCount;
		for (let i = 0; i < primitivesCount; i++) {
			const primitive = new QuadPrimitive(this._object as any, i) as CorePrimitive<CoreObjectType>;
			target[i]=(primitive);
		}
	}
}
