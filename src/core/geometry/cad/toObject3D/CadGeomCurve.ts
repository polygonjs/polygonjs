// import type {OpenCascadeInstance, TesselationParams, Geom_Curve, gp_Pnt, gp_Vec} from '../CadCommon';
// import {BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
// import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
// import {CAD_MATERIAL} from '../CadConstant';
// // import {withCadException} from '../CadExceptionHandler';
// import {ObjectType} from '../../Constant';
// import {CadLoader} from '../CadLoader';
// // import {cadShapeClone} from './CadShapeCommon';

// // function debugWithCircle(oc: OpenCascadeInstance) {
// // 	const radius = 5;
// // 	const axis = new oc.gp_Ax22d_1();
// // 	const circle = new oc.Geom2d_Circle_3(axis, radius);
// // 	// const circleHandle = new oc.Handle_Geom2d_Circle_2(circle);
// // 	const curve = new oc.Handle_Geom2d_Curve_2(circle);
// // 	const geom2Dadaptor = new oc.Geom2dAdaptor_Curve_2(curve);

// // 	const abscissa = 3;
// // 	const tolerance = 0.1;
// // 	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_6(geom2Dadaptor, abscissa, tolerance);
// // 	const sequence = new oc.TColgp_SequenceOfPnt2d_1();

// // 	if (uniformAbscissa.IsDone()) {
// // 		const pointsCount = uniformAbscissa.NbPoints();
// // 		console.log({pointsCount});
// // 		for (let i = 1; i <= pointsCount; i++) {
// // 			const point = new oc.gp_Pnt2d_1();
// // 			circle.D0(uniformAbscissa.Parameter(i), point);
// // 			sequence.Append_1(point);
// // 			console.log(point.X(), point.Y());
// // 		}
// // 	}
// // 	const abscissaVal = uniformAbscissa.Abscissa();
// // 	console.log({abscissaVal});

// // 	//   Handle(Geom2d_Circle) C =
// // 	//     new Geom2d_Circle(gp::OX2d(),radius);
// // 	//   Geom2dAdaptor_Curve GAC (C);
// // 	//   Standard_Real abscissa = 3;
// // 	//   GCPnts_UniformAbscissa UA (GAC,abscissa);
// // 	//   TColgp_SequenceOfPnt2d aSequence;
// // 	//   if (UA.IsDone())
// // 	//   {
// // 	//     Standard_Real N = UA.NbPoints();
// // 	//     Standard_Integer count = 1;
// // 	//     for(;count<=N;count++)
// // 	//     {
// // 	//       C->D0(UA.Parameter(count),P);
// // 	//       //Standard_Real Parameter = UA.Parameter(count);
// // 	//       // append P in a Sequence
// // 	//       aSequence.Append(P);
// // 	//     }
// // 	//   }
// // 	//   Standard_Real Abscissa  = UA.Abscissa();
// // }
// const STRIDE = 3;
// let point: gp_Pnt | undefined;
// export function cadGeomCurveToObject3D(
// 	oc: OpenCascadeInstance,
// 	curve: Geom_Curve,
// 	tesselationParams: TesselationParams
// ) {
// 	// let _object: Object3D = new Object3D();
// 	// withCadException(oc, () => {
// 	// console.log('debug start');
// 	// debugWithCircle(oc);
// 	// console.log('debug done');

// 	// const handle = oc.BRep_Tool.Curve_2(edge, 0, 1);
// 	// const curve = handle.get();
// 	const handle = new oc.Handle_Geom_Curve_2(curve);
// 	const geom2Dadaptor = new oc.GeomAdaptor_Curve_2(handle);

// 	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_2(
// 		geom2Dadaptor,
// 		tesselationParams.curveAbscissa,
// 		tesselationParams.curveTolerance
// 	);
// 	// const sequence = new oc.TColgp_SequenceOfPnt2d_1();

// 	let positions: number[] | undefined;
// 	let indices: number[] | undefined;
// 	point = point || new oc.gp_Pnt_1();

// 	if (uniformAbscissa.IsDone()) {
// 		const pointsCount = uniformAbscissa.NbPoints();
// 		console.log({pointsCount});

// 		positions = new Array(pointsCount * 3);
// 		indices = new Array(pointsCount);

// 		for (let i = 0; i < pointsCount; i++) {
// 			curve.D0(uniformAbscissa.Parameter(i + 1), point);
// 			// sequence.Append_1(point);
// 			const index = i * STRIDE;
// 			positions[index] = point.X();
// 			positions[index + 1] = point.Y();
// 			positions[index + 2] = point.Z();
// 			// positions[index+2]=point.X()
// 			// positions.push(point.X(), point.Y(), 0);
// 			if (i > 0) {
// 				indices[(i - 1) * 2] = i - 1;
// 				indices[(i - 1) * 2 + 1] = i;
// 			}
// 		}
// 	} else {
// 		console.warn('abscissa not done');
// 	}

// 	const geometry = new BufferGeometry();
// 	console.log({positions, indices});
// 	geometry.setAttribute('position', new Float32BufferAttribute(positions || [], 3));
// 	geometry.setIndex(indices || []);
// 	return BaseSopOperation.createObject(
// 		geometry,
// 		ObjectType.LINE_SEGMENTS,
// 		CAD_MATERIAL[ObjectType.LINE_SEGMENTS].plain
// 	);
// }

// let _t: gp_Vec | undefined;
// // let _transform: gp_Trsf | undefined;
// export function cadGeomCurveTransform(curve: Geom_Curve, t: Vector3, r: Vector3, s: Vector3) {
// 	const oc = CadLoader.oc();
// 	_t = _t || new oc.gp_Vec_1();
// 	// _pivot = _pivot || new oc.gp_Pnt2d_1();
// 	_t.SetCoord_2(t.x, t.y, t.z);
// 	// const curve = oc.BRep_Tool.Curve_2(edge, 0, 1).get();
// 	curve.Translate_1(_t);
// 	return curve;
// 	// curve.Rotate(_pivot, MathUtils.degToRad(r));
// 	// curve.Scale(_pivot, s);
// 	// point.SetX(point.X() + t.x);
// 	// point.SetY(point.Y() + t.y);
// 	// const newPoint = new oc.gp_Pnt2d_3(point.X() + t.x, point.Y() + t.y);
// 	// return newPoint;
// 	// return cadEdgeCreate(oc, curve);
// }

// export function cadGeomCurveClone(src: Geom_Curve): Geom_Curve {
// 	return src;
// 	// const oc = CadLoader.oc();
// 	// return oc.TopoDS.Edge_1(src)
// 	// return oc.TopoDS.Edge_1(cadShapeClone(src));
// }
