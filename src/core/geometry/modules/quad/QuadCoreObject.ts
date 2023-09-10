import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {QuadObject} from './QuadObject';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {CoreObjectType, MergeCompactOptions} from '../../ObjectContent';
import {TransformTargetType} from '../../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import {QuadGeometry} from './QuadGeometry';

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
		const {objects, mergedObjects} = options;

		const quadObjects = objects as QuadObject[];

		let previousGeometry: QuadGeometry | undefined;
		for (let object of quadObjects) {
			console.warn(object, 'quad merge not implemented');
			// if (previousGeometry) {
			// 	previousGeometry = manifold.union(previousGeometry, object.SDFGeometry());
			// } else {
			// 	previousGeometry = object.SDFGeometry();
			// }
		}
		if (previousGeometry) {
			mergedObjects.push(new QuadObject(previousGeometry));
		}
	}
}
