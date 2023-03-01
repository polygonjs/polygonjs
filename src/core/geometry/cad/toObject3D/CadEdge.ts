import type {OpenCascadeInstance, TopoDS_Edge, TesselationParams, Geom_Curve, gp_Pnt, gp_Vec} from '../CadCommon';
import {BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {CAD_MATERIAL} from '../CadConstant';
// import {withCadException} from '../CadExceptionHandler';
import {ObjectType} from '../../Constant';
import {CadLoader} from '../CadLoader';
import {cadShapeClone} from './CadShapeCommon';

const STRIDE = 3;
let point: gp_Pnt | undefined;
const v0 = {current: 0};
const v1 = {current: 0};
// const WITH_ORIENTATION = true;
export function cadEdgeToObject3D(oc: OpenCascadeInstance, edge: TopoDS_Edge, tesselationParams: TesselationParams) {
	const geometry = cadEdgeToBufferGeometry(oc, edge, tesselationParams);
	return BaseSopOperation.createObject(
		geometry,
		ObjectType.LINE_SEGMENTS,
		CAD_MATERIAL[ObjectType.LINE_SEGMENTS].plain
	);
}
export function cadEdgeToBufferGeometry(
	oc: OpenCascadeInstance,
	edge: TopoDS_Edge,
	tesselationParams: TesselationParams
) {
	// TODO: in the build process,
	// update the types so that we replace:
	// type Standard_Real = number;
	// with:
	// type Standard_Real = number | { current: number };
	oc.BRep_Tool.Range_1(edge, v0 as any, v1 as any);
	const handle = oc.BRep_Tool.Curve_2(edge, v0.current, v1.current);
	const curve = handle.get();
	const geom2Dadaptor = new oc.GeomAdaptor_Curve_2(handle);

	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_3(
		geom2Dadaptor,
		tesselationParams.curveAbscissa,
		v0.current,
		v1.current,
		tesselationParams.curveTolerance
	);

	let positions: number[] | undefined;
	let indices: number[] | undefined;
	point = point || new oc.gp_Pnt_1();

	if (uniformAbscissa.IsDone()) {
		const pointsCount = uniformAbscissa.NbPoints();

		positions = new Array(pointsCount * 3);
		indices = new Array(pointsCount);

		for (let i = 0; i < pointsCount; i++) {
			curve.D0(uniformAbscissa.Parameter(i + 1), point);
			const index = i * STRIDE;
			positions[index] = point.X();
			positions[index + 1] = point.Y();
			positions[index + 2] = point.Z();
			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}
	} else {
		console.warn('abscissa not done');
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions || [], 3));
	geometry.setIndex(indices || []);
	return geometry;
}

export function cadEdgeCreate(oc: OpenCascadeInstance, curve: Geom_Curve): TopoDS_Edge {
	const handle = new oc.Handle_Geom_Curve_2(curve);
	const api = new oc.BRepBuilderAPI_MakeEdge_24(handle);
	const edge = api.Edge();
	return edge;
}

let _t: gp_Vec | undefined;
// let _transform: gp_Trsf | undefined;
export function cadEdgeTransform(edge: TopoDS_Edge, t: Vector3, r: Vector3, s: Vector3) {
	const oc = CadLoader.oc();
	_t = _t || new oc.gp_Vec_1();
	// _pivot = _pivot || new oc.gp_Pnt2d_1();
	_t.SetCoord_2(t.x, t.y, t.z);
	const curve = oc.BRep_Tool.Curve_2(edge, 0, 1).get();
	curve.Translate_1(_t);
	// curve.Rotate(_pivot, MathUtils.degToRad(r));
	// curve.Scale(_pivot, s);
	// point.SetX(point.X() + t.x);
	// point.SetY(point.Y() + t.y);
	// const newPoint = new oc.gp_Pnt2d_3(point.X() + t.x, point.Y() + t.y);
	// return newPoint;
	return cadEdgeCreate(oc, curve);
}

export function cadEdgeClone(src: TopoDS_Edge): TopoDS_Edge {
	const oc = CadLoader.oc();
	return oc.TopoDS.Edge_1(cadShapeClone(src));
}
