import {Matrix4, Box3, Sphere, Vector3} from 'three';
import {CsgObject} from './CsgObject';
import {CsgGeometryType} from './CsgCommon';
import {csgIsGeom2, csgIsGeom3} from './CsgCoreType';
import {BaseCoreObject} from '../_BaseObject';
import {CoreObjectType, MergeCompactOptions} from '../ObjectContent';
import {TransformTargetType} from '../../Transform';
import {ObjectTransformSpace} from '../../TransformSpace';
import {TypeAssert} from '../../../engine/poly/Assert';
import {csgApplyTransform, csgApplyMatrix4} from './math/CsgMat4';
import {booleans, geometries} from '@jscad/modeling';
const {union} = booleans;

const _bbox = new Box3();
export class CsgCoreObject<T extends CsgGeometryType> extends BaseCoreObject<CoreObjectType.CSG> {
	constructor(protected override _object: CsgObject<T>, index: number) {
		super(_object, index);
	}
	static override position(object: CsgObject<CsgGeometryType>, target: Vector3) {
		object.boundingBox(_bbox);
		_bbox.getCenter(target);
	}
	override boundingBox(target: Box3) {
		this._object.boundingBox(target);
	}
	override boundingSphere(target: Sphere) {
		this._object.boundingSphere(target);
	}

	static override applyMatrix<T extends CsgGeometryType>(
		object: CsgObject<T>,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace
	) {
		switch (transformTargetType) {
			case TransformTargetType.GEOMETRY: {
				return csgApplyMatrix4(object.csgGeometry(), matrix);
			}
			case TransformTargetType.OBJECT: {
				return object.applyMatrix4(matrix);
			}
		}
		TypeAssert.unreachable(transformTargetType);
	}
	static override mergeCompact<T extends CsgGeometryType>(options: MergeCompactOptions) {
		const {objects, materialsByObjectType, mergedObjects, onError} = options;
		try {
			const csgObjects = objects as CsgObject<T>[];
			const geometries = csgObjects.map((o) => o.csgGeometry());
			const geom2s: geometries.geom2.Geom2[] = [];
			const geom3s: geometries.geom3.Geom3[] = [];
			for (let geometry of geometries) {
				if (csgIsGeom2(geometry)) {
					geom2s.push(geometry);
				}
				if (csgIsGeom3(geometry)) {
					geom3s.push(geometry);
				}
			}

			const _merge = (typedGeometries: Array<geometries.geom2.Geom2> | Array<geometries.geom3.Geom3>) => {
				if (typedGeometries.length == 0) {
					return;
				}
				typedGeometries.forEach(csgApplyTransform);
				const mergedGeom = union(typedGeometries as Array<geometries.geom2.Geom2>);
				const newObject = new CsgObject(mergedGeom);
				const material = materialsByObjectType.get(newObject.type);
				if (material) {
					newObject.material = material;
				}
				mergedObjects.push(newObject);
			};
			_merge(geom2s);
			_merge(geom3s);
		} catch (e) {
			onError((e as Error).message || 'unknown error');
		}
	}
}
