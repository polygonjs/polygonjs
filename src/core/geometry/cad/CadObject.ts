import {
	Geom2d_Curve,
	TopoDS_Edge,
	TopoDS_Wire,
	TopoDS_Vertex,
	TopoDS_Shape,
	gp_Pnt2d,
	CadGeometryType,
	CadTypeMap,
	cadGeometryTypeFromShape,
	cadDowncast,
	CADTesselationParams,
	CadBox3Handle,
	_createCadBox3Handle,
	CadGeometryTypeShape,
} from './CadCommon';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, objectContentCopyProperties} from '../ObjectContent';
import {cadPnt2dClone, cadPnt2dToObject3D} from './toObject3D/CadPnt2d';
import {cadVertexClone, cadVertexToObject3D} from './toObject3D/CadVertex';
import {
	cadGeom2dCurveClone,
	cadGeom2dCurveToBufferGeometry,
	cadGeom2dCurveToObject3D,
	CURVE_2D_TESSELATION_PARAMS,
} from './toObject3D/CadGeom2dCurve';
import {cadEdgeClone, cadEdgeObjectToObject3D} from './toObject3D/CadEdge';
import {cadWireClone, cadWireToObject3D} from './toObject3D/CadWire';
import {CoreCadType} from './CadCoreType';
import {CadLoaderSync} from './CadLoaderSync';
import {cadShapeClone} from './toObject3D/CadShapeCommon';
import {TypeAssert} from '../../../engine/poly/Assert';
import {cadShapeToObject3D} from './toObject3D/CadShape';
import {Object3D, Material, Matrix4, Box3, Vector3, Quaternion, Euler} from 'three';
import {cadGeometryTransform} from './operations/CadTransform';
import {BaseSopNodeType} from '../../../engine/nodes/sop/_Base';
import {cadCompoundToObject3D} from './toObject3D/CadCompound';
const t = new Vector3();
const q = new Quaternion();
const s = new Vector3();
const euler = new Euler();
const r = new Vector3();
const pivot = new Vector3();

const DEFAULT_BND_BOX: CadBox3Handle = _createCadBox3Handle();
const BBOX_EMPTY = new Box3();

// const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export class CadObject<T extends CadGeometryType> implements ObjectContent<CoreObjectType.CAD> {
	public visible = true;
	get geometry() {
		return this._geometry as ObjectGeometryMap[CoreObjectType.CAD];
	}
	get type() {
		return this._type;
	}
	userData = {};
	name = '';
	castShadow = true;
	receiveShadow = true;
	renderOrder = 0;
	frustumCulled = true;
	matrixAutoUpdate = false;
	material: Material | undefined;
	children: ObjectContent<CoreObjectType.CAD>[] = [];
	parent: ObjectContent<CoreObjectType.CAD> | null = null;
	constructor(private _geometry: CadTypeMap[T], private _type: T) {
		this._validate();
	}
	setGeometry<TE extends CadGeometryType>(geometry: CadTypeMap[TE], type: TE) {
		this._geometry = geometry as CadTypeMap[T];
		this._type = type as any as T;
		this._validate();
	}
	private _validate() {
		if (CoreCadType.isGeometryShape(this._geometry)) {
			const oc = CadLoaderSync.oc();
			if (oc) {
				this._geometry = cadDowncast(oc, this._geometry) as CadTypeMap[T];
				const type = cadGeometryTypeFromShape(oc, this._geometry as any) as T;
				if (type) {
					this._type = type;
				} else {
					console.error('no type for geometry', this._geometry);
				}
			}
		} else {
			if (this.type == null) {
				console.error('type is required for geometry', this._geometry);
			}
		}
	}
	// static fromGeometry<T extends CadGeometryType>(geometry: CadTypeMap[T], type: T) {
	// 	return new CadObject(geometry, type);
	// }
	// type() {
	// 	return this._type!;
	// }
	cadGeometry() {
		return this.geometry! as CadTypeMap[T];
	}
	dispose() {}
	applyMatrix4(matrix: Matrix4) {
		matrix.decompose(t, q, s);
		euler.setFromQuaternion(q);
		r.set(euler.x, euler.y, euler.z).multiplyScalar(RAD2DEG);
		const newGeometry = cadGeometryTransform(this.type, this.cadGeometry(), t, r, s.x, pivot);
		if (newGeometry) {
			const oc = CadLoaderSync.oc();
			if (CoreCadType.isGeometryShape(newGeometry)) {
				const newType = cadGeometryTypeFromShape(oc, newGeometry);
				if (newType) {
					this.setGeometry(newGeometry, newType);
				}
			} else {
				// no need to re-add as it is transformed in place
			}
		}
	}
	traverse(callback: (object: CadObject<T>) => any) {
		callback(this);
	}

	clone(): CadObject<T> {
		const geometry = cloneCadGeometry(this.type, this.cadGeometry());
		const clone = new CadObject(geometry, this.type);

		objectContentCopyProperties(this, clone);
		return clone;
	}
	toObject3D(
		tesselationParams: CADTesselationParams,
		displayNode: BaseSopNodeType
	): Object3D | Object3D[] | undefined {
		return CadObject.toObject3D(this, this.type, tesselationParams, displayNode);
	}

	static toObject3D<T extends CadGeometryType>(
		cadObject: CadObject<T>,
		type: T,
		tesselationParams: CADTesselationParams,
		displayNode: BaseSopNodeType
	): Object3D | Object3D[] | undefined {
		switch (type) {
			case CadGeometryType.POINT_2D: {
				return cadPnt2dToObject3D(cadObject as CadObject<CadGeometryType.POINT_2D>);
			}
			case CadGeometryType.CURVE_2D: {
				return cadGeom2dCurveToObject3D(cadObject as CadObject<CadGeometryType.CURVE_2D>, tesselationParams);
			}
			// case CadObjectType.CURVE_3D: {
			// 	return cadGeomCurveToObject3D(oc, object as Geom_Curve, tesselationParams);
			// }
			case CadGeometryType.VERTEX: {
				return cadVertexToObject3D(cadObject as CadObject<CadGeometryType.VERTEX>);
			}
			case CadGeometryType.EDGE: {
				return cadEdgeObjectToObject3D(cadObject as CadObject<CadGeometryType.EDGE>, tesselationParams);
			}
			case CadGeometryType.WIRE: {
				return cadWireToObject3D(cadObject as CadObject<CadGeometryType.WIRE>, tesselationParams);
			}
			case CadGeometryType.FACE:
			case CadGeometryType.SHELL:
			case CadGeometryType.SOLID:
			case CadGeometryType.COMPSOLID: {
				return cadShapeToObject3D(cadObject as CadObject<CadGeometryTypeShape>, tesselationParams, displayNode);
			}
			case CadGeometryType.COMPOUND: {
				return cadCompoundToObject3D(
					cadObject as CadObject<CadGeometryType.COMPOUND>,
					tesselationParams,
					displayNode
				);
			}
		}
		TypeAssert.unreachable(type);

		// const geometry = cadObject.cadGeometry();

		// const buildObject = () => {

		// };
		// const object3D = buildObject();
		// if (object3D) {
		// 	if (CoreType.isArray(object3D)) {
		// 		for (let object of object3D) {
		// 			objectContentCopyProperties(cadObject, object);
		// 		}
		// 	} else {
		// 		objectContentCopyProperties(cadObject, object3D);
		// 	}
		// }
		// return object3D;
	}

	boundingBox(target: Box3): void {
		const oc = CadLoaderSync.oc();
		const Bnd_Box = CadLoaderSync.Bnd_Box;
		Bnd_Box.SetVoid();
		const useTriangulation = true;
		if (CoreCadType.isShape(this)) {
			oc.BRepBndLib.Add(this.cadGeometry() as TopoDS_Shape, Bnd_Box, useTriangulation);
			Bnd_Box.Get(
				DEFAULT_BND_BOX.min.x as any,
				DEFAULT_BND_BOX.min.y as any,
				DEFAULT_BND_BOX.min.z as any,
				DEFAULT_BND_BOX.max.x as any,
				DEFAULT_BND_BOX.max.y as any,
				DEFAULT_BND_BOX.max.z as any
			);
			target.min.x = DEFAULT_BND_BOX.min.x.current;
			target.min.y = DEFAULT_BND_BOX.min.y.current;
			target.min.z = DEFAULT_BND_BOX.min.z.current;
			target.max.x = DEFAULT_BND_BOX.max.x.current;
			target.max.y = DEFAULT_BND_BOX.max.y.current;
			target.max.z = DEFAULT_BND_BOX.max.z.current;
			return;
		} else {
			switch (this.type) {
				case CadGeometryType.POINT_2D: {
					const point = this.cadGeometry() as gp_Pnt2d;
					target.min.x = point.X();
					target.min.y = point.Y();
					target.min.z = 0;
					target.max.x = point.X();
					target.max.y = point.Y();
					target.max.z = 0;
					return;
				}
				case CadGeometryType.CURVE_2D: {
					const geometry = cadGeom2dCurveToBufferGeometry(
						this as CadObject<CadGeometryType.CURVE_2D>,
						CURVE_2D_TESSELATION_PARAMS
					);
					geometry.computeBoundingBox();
					if (geometry.boundingBox) {
						target.copy(geometry.boundingBox);
					} else {
						target.copy(BBOX_EMPTY);
					}
					return;
				}
				default: {
					console.warn('cad BoundingBox not implemented for type', this.type);
					target.copy(BBOX_EMPTY);
				}
			}
		}
		// switch (type) {

		// }
	}
}

function cloneCadGeometry<T extends CadGeometryType>(type: CadGeometryType, srcGeometry: CadTypeMap[T]): CadTypeMap[T] {
	switch (type) {
		case CadGeometryType.POINT_2D: {
			return cadPnt2dClone(srcGeometry as gp_Pnt2d) as CadTypeMap[T];
		}
		case CadGeometryType.CURVE_2D: {
			return cadGeom2dCurveClone(srcGeometry as Geom2d_Curve) as CadTypeMap[T];
		}
		// case CadObjectType.CURVE_3D: {
		// 	return cadGeomCurveClone(srcObject as Geom_Curve) as CadTypeMap[T];
		// }
		case CadGeometryType.VERTEX: {
			return cadVertexClone(srcGeometry as TopoDS_Vertex) as CadTypeMap[T];
		}
		case CadGeometryType.EDGE: {
			return cadEdgeClone(srcGeometry as TopoDS_Edge) as CadTypeMap[T];
		}
		case CadGeometryType.WIRE: {
			return cadWireClone(srcGeometry as TopoDS_Wire) as CadTypeMap[T];
		}
		case CadGeometryType.FACE:
		case CadGeometryType.SHELL:
		case CadGeometryType.SOLID:
		case CadGeometryType.COMPSOLID:
		case CadGeometryType.COMPOUND: {
			return cadShapeClone(srcGeometry as TopoDS_Shape) as CadTypeMap[T];
		}
	}
	TypeAssert.unreachable(type);
}

// const ORIGIN = new Vector3(0, 0, 0);
// export function cadObjectPosition<T extends CadGeometryType>(cadObject: CadObject<T>) {
// 	console.warn('cadObjectPosition not implemented');
// 	return ORIGIN;
// }
