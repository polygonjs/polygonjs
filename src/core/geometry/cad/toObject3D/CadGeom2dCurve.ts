import type {OpenCascadeInstance, Geom2d_Curve, TesselationParams, gp_Pnt2d, gp_Vec2d} from '../CadCommon';
import {BufferGeometry, Float32BufferAttribute, Vector2, MathUtils} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {CAD_MATERIAL} from '../CadConstant';
import {CadLoader} from '../CadLoader';
// import {withCadException} from '../CadExceptionHandler';
import {ObjectType} from '../../Constant';

// function debugWithCircle(oc: OpenCascadeInstance) {
// 	const radius = 5;
// 	const axis = new oc.gp_Ax22d_1();
// 	const circle = new oc.Geom2d_Circle_3(axis, radius);
// 	// const circleHandle = new oc.Handle_Geom2d_Circle_2(circle);
// 	const curve = new oc.Handle_Geom2d_Curve_2(circle);
// 	const geom2Dadaptor = new oc.Geom2dAdaptor_Curve_2(curve);

// 	const abscissa = 3;
// 	const tolerance = 0.1;
// 	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_6(geom2Dadaptor, abscissa, tolerance);
// 	const sequence = new oc.TColgp_SequenceOfPnt2d_1();

// 	if (uniformAbscissa.IsDone()) {
// 		const pointsCount = uniformAbscissa.NbPoints();
// 		console.log({pointsCount});
// 		for (let i = 1; i <= pointsCount; i++) {
// 			const point = new oc.gp_Pnt2d_1();
// 			circle.D0(uniformAbscissa.Parameter(i), point);
// 			sequence.Append_1(point);
// 			console.log(point.X(), point.Y());
// 		}
// 	}
// 	const abscissaVal = uniformAbscissa.Abscissa();
// 	console.log({abscissaVal});

// 	//   Handle(Geom2d_Circle) C =
// 	//     new Geom2d_Circle(gp::OX2d(),radius);
// 	//   Geom2dAdaptor_Curve GAC (C);
// 	//   Standard_Real abscissa = 3;
// 	//   GCPnts_UniformAbscissa UA (GAC,abscissa);
// 	//   TColgp_SequenceOfPnt2d aSequence;
// 	//   if (UA.IsDone())
// 	//   {
// 	//     Standard_Real N = UA.NbPoints();
// 	//     Standard_Integer count = 1;
// 	//     for(;count<=N;count++)
// 	//     {
// 	//       C->D0(UA.Parameter(count),P);
// 	//       //Standard_Real Parameter = UA.Parameter(count);
// 	//       // append P in a Sequence
// 	//       aSequence.Append(P);
// 	//     }
// 	//   }
// 	//   Standard_Real Abscissa  = UA.Abscissa();
// }
const STRIDE = 3;
let point: gp_Pnt2d | undefined;
export function cadGeom2dCurveToObject3D(
	oc: OpenCascadeInstance,
	object: Geom2d_Curve,
	tesselationParams: TesselationParams
) {
	// let _object: Object3D = new Object3D();
	// withCadException(oc, () => {
	// console.log('debug start');
	// debugWithCircle(oc);
	// console.log('debug done');

	const curve = new oc.Handle_Geom2d_Curve_2(object);
	const geom2Dadaptor = new oc.Geom2dAdaptor_Curve_2(curve);

	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_6(
		geom2Dadaptor,
		tesselationParams.curveAbscissa,
		tesselationParams.curveTolerance
	);
	// const sequence = new oc.TColgp_SequenceOfPnt2d_1();

	let positions: number[] | undefined;
	let indices: number[] | undefined;
	point = point || new oc.gp_Pnt2d_1();

	if (uniformAbscissa.IsDone()) {
		const pointsCount = uniformAbscissa.NbPoints();

		positions = new Array(pointsCount * 3).fill(0);
		indices = new Array(pointsCount);

		for (let i = 0; i < pointsCount; i++) {
			object.D0(uniformAbscissa.Parameter(i + 1), point);
			// sequence.Append_1(point);
			const index = i * STRIDE;
			positions[index] = point.X();
			positions[index + 1] = point.Y();
			// positions[index+2]=point.X()
			// positions.push(point.X(), point.Y(), 0);
			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}
	}
	// const abscissaVal = uniformAbscissa.Abscissa();
	// console.log({abscissaVal});

	const geometry = new BufferGeometry();
	console.log({positions, indices});
	geometry.setAttribute('position', new Float32BufferAttribute(positions || [], 3));
	geometry.setIndex(indices || []);
	return BaseSopOperation.createObject(
		geometry,
		ObjectType.LINE_SEGMENTS,
		CAD_MATERIAL[ObjectType.LINE_SEGMENTS].plain
	);

	// const curve = new oc.Handle_Geom_Curve_2(object);
	// console.log('A');
	// // const makeEdge = new oc.BRepBuilderAPI_MakeEdge_24(curve);
	// // console.log('B');
	// // const edge = makeEdge.Edge();
	// console.log('C');

	// // adaptor
	// const adaptor = new oc.GeomAdaptor_Curve_2(curve);
	// console.log('D');

	// // new oc.GCPnts_UniformAbscissa_2(adaptor, 0.1, 0.1);
	// console.log('E 1');
	// console.log(adaptor.GetType());
	// console.log('E 2');
	// const bezierHandle = adaptor.Bezier();
	// console.log('e 2');
	// console.log(bezierHandle);
	// const bezier = bezierHandle.get();
	// console.log('E');
	// console.log(bezier);

	// const pointsCount = bezier.NbPoles();
	// console.log('F', {pointsCount});
	// const positions: number[] = [];
	// for (let i = 0; i < pointsCount; i++) {
	// 	console.log(i, i / pointsCount);
	// 	const point = bezier.Pole(i / pointsCount);
	// 	console.log(point);
	// 	positions.push(point.X(), point.Y(), point.Z());
	// }

	// const geo = new BufferGeometry();
	// geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	// // const object = this.createObject(geometry, ObjectType.POINTS);
	// // geo.computeVertexNormals();
	// return BaseSopOperation.createObject(geo, ObjectType.POINTS, CAD_MATERIAL[ObjectType.POINTS]);

	// adaptor.set
	// const elspine = new oc.ChFiDS_ElSpine()
	// elspine.setCurve(curve)
	// adaptor.get

	//

	// const wireFromEdge = new oc.BRepBuilderAPI_MakeWire_2(edge);
	// const wire = wireFromEdge.Wire();
	// // const mkWire = new oc.BRepBuilderAPI_MakeWire_1();
	// // mkWire.Add_2(wire.Wire());

	// // const path = [
	// // 	[-1, 0, 0],
	// // 	[1, 0, 0],
	// // 	[1, 2, 0],
	// // ].map(([x, y, z]) => new oc.gp_Pnt_3(x, y, z));
	// // const makePolygon = new oc.BRepBuilderAPI_MakePolygon_3(path[0], path[1], path[2], true);
	// // const wire = makePolygon.Wire();
	// const f = new oc.BRepBuilderAPI_MakeFace_15(wire, true);
	// const shape = f.Shape();
	// console.log({object});
	// return cadShapeToObject3D({oc, object: shape, linearDeflection, angularDeflection, traverseEdgesIfNoTris: true});
	// });
	// return _object;
}

let _t: gp_Vec2d | undefined;
let _pivot: gp_Pnt2d | undefined;
export function cadGeom2dCurveTransform(curve: Geom2d_Curve, t: Vector2, r: number, s: number) {
	const oc = CadLoader.oc();
	_t = _t || new oc.gp_Vec2d_1();
	_pivot = _pivot || new oc.gp_Pnt2d_1();
	_t.SetCoord_2(t.x, t.y);
	curve.Translate_1(_t);
	curve.Rotate(_pivot, MathUtils.degToRad(r));
	curve.Scale(_pivot, s);
	// point.SetX(point.X() + t.x);
	// point.SetY(point.Y() + t.y);
	// const newPoint = new oc.gp_Pnt2d_3(point.X() + t.x, point.Y() + t.y);
	// return newPoint;
}

export function cadGeom2dCurveClone(src: Geom2d_Curve): Geom2d_Curve {
	// Not great, not terrible
	return src.Reversed().get().Reversed().get();
}
