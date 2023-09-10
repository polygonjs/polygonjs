// import type {OpenCascadeInstance} from 'opencascade.js';
import {
	// CadGeometry,
	// CadGeometry,
	// Geom2d_Curve,
	// TopoDS_Edge,
	// TopoDS_Wire,
	// TopoDS_Vertex,
	// TopoDS_Shape,
	// gp_Pnt2d,
	CadGeometryType,
	CadTypeMap,
	// CadTypeMap,
	// TesselationParams,
	// cadGeometryTypeFromShape,
	// cadDowncast,
} from './CadCommon';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {CadObject} from './CadObject';
import {CoreObjectType, MergeCompactOptions, objectContentCopyProperties} from '../../ObjectContent';
import {Box3, Matrix4, Sphere, Vector3} from 'three';
import {TransformTargetType} from '../../../Transform';
import {ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import {cadMergeCompact} from './utils/CadMerge';

const _bbox = new Box3();
const _bboxSize = new Vector3();
export class CadCoreObject<T extends CadGeometryType> extends BaseCoreObject<CoreObjectType.CAD> {
	constructor(protected override _object: CadObject<T>, index: number) {
		super(_object, index);

		// if ((_object as TopoDS_Shape).ShapeType) {
		// 	const type = cadObjectTypeFromShape(oc, _object as any);
		// 	if (type != null && type != _type) {
		// 		console.error('got type', type, 'instead of expected', _type);
		// 	}
		// }
	}
	type() {
		return this._object.type;
	}

	static fromGeometry<T extends CadGeometryType>(geometry: CadTypeMap[T], type: T) {
		const cadObject = new CadObject(geometry, type);
		return new CadCoreObject(cadObject, 0);
	}
	override object() {
		return this._object;
	}
	static override position(object: CadObject<CadGeometryType>, target: Vector3) {
		object.boundingBox(_bbox);
		_bbox.getCenter(target);
	}
	override boundingBox(target: Box3) {
		this._object.boundingBox(target);
	}
	override boundingSphere(target: Sphere) {
		this.boundingBox(_bbox);
		_bbox.getSize(_bboxSize);
		_bbox.getCenter(target.center);
		const diameter = Math.max(_bboxSize.x, _bboxSize.y, _bboxSize.z);
		target.radius = diameter * 0.5;
	}

	static override applyMatrix<T extends CadGeometryType>(
		object: CadObject<T>,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace,
		transformMode: ObjectTransformMode
	) {
		object.applyMatrix4(matrix);
	}
	static override mergeCompact(options: MergeCompactOptions) {
		const {objects, material, mergedObjects, onError} = options;
		try {
			const firstObject = objects[0];
			if (!firstObject) {
				return;
			}
			const newObjects = cadMergeCompact(objects as CadObject<CadGeometryType>[]);

			for (let newObject of newObjects) {
				objectContentCopyProperties(firstObject, newObject);
				if (material) {
					newObject.material = material;
				}
			}

			mergedObjects.push(...newObjects);
		} catch (e) {
			onError((e as Error).message || 'unknown error');
		}
	}
}
