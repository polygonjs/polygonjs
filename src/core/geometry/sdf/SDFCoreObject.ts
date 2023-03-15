import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {SDFObject} from './SDFObject';
import {BaseCoreObject} from '../_BaseObject';
import {CoreObjectType, MergeCompactOptions} from '../ObjectContent';
import {TransformTargetType} from '../../Transform';
import {ObjectTransformSpace} from '../../TransformSpace';

export class SDFCoreObject extends BaseCoreObject<CoreObjectType.SDF> {
	constructor(protected override _object: SDFObject, index: number) {
		super(_object, index);
	}
	static override position(object: SDFObject, target: Vector3) {
		console.warn('not implemented');
	}
	override boundingBox(target: Box3) {
		console.warn('not implemented');
	}
	override boundingSphere(target: Sphere) {
		console.warn('not implemented');
	}

	static override applyMatrix(
		object: SDFObject,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace
	) {
		console.warn('not implemented');
	}
	static override mergeCompact(options: MergeCompactOptions) {
		console.warn('not implemented');
	}
}
