import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {BaseCoreObject} from '../_BaseObject';
import {CoreObjectType, MergeCompactOptions} from '../ObjectContent';
import {TransformTargetType} from '../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../TransformSpace';
import {TetObject} from './TetObject';

const _bbox = new Box3();
export class TetCoreObject extends BaseCoreObject<CoreObjectType.TET> {
	constructor(protected override _object: TetObject, index: number) {
		super(_object, index);
	}
	static override position(object: TetObject, target: Vector3) {
		object.boundingBox(_bbox);
		_bbox.getCenter(target);
	}
	override boundingBox(target: Box3) {
		this._object.boundingBox(target);
	}
	override boundingSphere(target: Sphere) {
		this._object.boundingSphere(target);
	}

	static override applyMatrix(
		object: TetObject,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace,
		transformMode: ObjectTransformMode
	) {
		console.warn('applyMatrix4 not implemented');
		// switch (transformTargetType) {
		// 	case TransformTargetType.GEOMETRY: {
		// 		return csgApplyMatrix4(object.csgGeometry(), matrix);
		// 	}
		// 	case TransformTargetType.OBJECT: {
		// 		return object.applyMatrix4(matrix);
		// 	}
		// }
		// TypeAssert.unreachable(transformTargetType);
	}
	static override mergeCompact(options: MergeCompactOptions) {
		console.warn('mergeCompact not implemented');
		// const {objects, material, mergedObjects, onError} = options;
		// try {
		// 	const csgObjects = objects as TetObject[];
		// 	const firstObject = csgObjects[0];
		// 	if (!firstObject) {
		// 		return;
		// 	}
		// 	const geometries = csgObjects.map((o) => o.csgGeometry());
		// 	const geom2s: geometries.geom2.Geom2[] = [];
		// 	const geom3s: geometries.geom3.Geom3[] = [];
		// 	for (let geometry of geometries) {
		// 		if (csgIsGeom2(geometry)) {
		// 			geom2s.push(geometry);
		// 		}
		// 		if (csgIsGeom3(geometry)) {
		// 			geom3s.push(geometry);
		// 		}
		// 	}

		// 	const _merge = (typedGeometries: Array<geometries.geom2.Geom2> | Array<geometries.geom3.Geom3>) => {
		// 		if (typedGeometries.length == 0) {
		// 			return;
		// 		}
		// 		typedGeometries.forEach(csgApplyTransform);
		// 		const mergedGeom = union(typedGeometries as Array<geometries.geom2.Geom2>);
		// 		const newObject = new CsgObject(mergedGeom);
		// 		objectContentCopyProperties(firstObject, newObject);
		// 		if (material) {
		// 			newObject.material = material;
		// 		}
		// 		mergedObjects.push(newObject);
		// 	};
		// 	_merge(geom2s);
		// 	_merge(geom3s);
		// } catch (e) {
		// 	onError((e as Error).message || 'unknown error');
		// }
	}
}
