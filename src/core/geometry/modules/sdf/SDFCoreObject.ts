import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {SDFObject} from './SDFObject';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {CoreObjectType, MergeCompactOptions} from '../../ObjectContent';
import {TransformTargetType} from '../../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import {SDFLoaderSync} from './SDFLoaderSync';
import {SDFGeometry} from './SDFCommon';

const _box = new Box3();
export class SDFCoreObject extends BaseCoreObject<CoreObjectType.SDF> {
	protected override _object: SDFObject;
	constructor(_object: SDFObject, index: number) {
		super(_object, index);
		this._object = _object;
	}
	static override position(object: SDFObject, target: Vector3) {
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
		object: SDFObject,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace,
		transformMode: ObjectTransformMode
	) {
		object.applyMatrix4(matrix);
	}
	static override mergeCompact(options: MergeCompactOptions) {
		const manifold = SDFLoaderSync.manifold();
		const {objects, mergedObjects} = options;

		const sdfObjects = objects as SDFObject[];

		let previousGeometry: SDFGeometry | undefined;
		for (const object of sdfObjects) {
			if (previousGeometry) {
				previousGeometry = manifold.Manifold.union(previousGeometry, object.SDFGeometry());
			} else {
				previousGeometry = object.SDFGeometry();
			}
		}
		if (previousGeometry) {
			mergedObjects.push(new SDFObject(previousGeometry));
		}
	}
}
