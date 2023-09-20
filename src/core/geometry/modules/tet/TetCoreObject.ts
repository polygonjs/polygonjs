import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {CoreObjectType, MergeCompactOptions, ObjectContent} from '../../ObjectContent';
import {TransformTargetType} from '../../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import {TetObject} from './TetObject';
import {TetVertex} from './TetVertex';
import {ObjectData} from '../../Constant';
import {objectData} from '../../entities/object/BaseCoreObjectUtils';

const _bbox = new Box3();
export class TetCoreObject extends BaseCoreObject<CoreObjectType.TET> {
	protected override _object: TetObject;
	constructor(_object: TetObject, index: number) {
		super(_object, index);
		this._object = _object;
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

	static override objectData<T extends CoreObjectType>(object: ObjectContent<T>): ObjectData {
		const data = objectData(object);

		const tetObject = object as any as TetObject;
		data.pointsCount = tetObject.geometry.pointsCount();
		data.verticesCount = TetVertex.verticesCount(object);
		data.primitivesCount = tetObject.geometry.tetsCount();
		data.primitiveName = 'tetrahedrons';

		return data;
	}

	static override applyMatrix(
		object: TetObject,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace,
		transformMode: ObjectTransformMode
	) {
		object.applyMatrix4(matrix);
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
