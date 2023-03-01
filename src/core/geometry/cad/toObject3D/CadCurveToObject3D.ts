// import type {OpenCascadeInstance, Geom_Curve} from '../CadCommon';
// import {
// 	// BufferGeometry,
// 	// BufferAttribute,
// 	Object3D,
// } from 'three';
// // import {CAD_MATERIAL} from '../CadConstant';
// import {withCadException} from '../CadExceptionHandler';
// // import {ObjectType} from '../../Constant';
// // import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';

// function debugWithCircle(oc: OpenCascadeInstance) {
// 	const radius = 5;
// 	const axis = new oc.gp_Ax22d_1();
// 	console.log('1');
// 	const circle = new oc.Geom2d_Circle_3(axis, radius);
// 	console.log('2');
// 	// const circleHandle = new oc.Handle_Geom2d_Circle_2(circle);
// 	const curve = new oc.Handle_Geom2d_Curve_2(circle);
// 	console.log('3');
// 	const geom2Dadaptor = new oc.Geom2dAdaptor_Curve_2(curve);
// 	console.log('4');

// 	const abscissa = 3;
// 	const tolerance = 0.1;
// 	console.log('5');
// 	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_6(geom2Dadaptor, abscissa, tolerance);
// 	console.log('6');
// 	const sequence = new oc.TColgp_SequenceOfPnt2d_1();
// 	console.log('7');

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

// export function cadCurveToObject3D(
// 	oc: OpenCascadeInstance,
// 	object: Geom_Curve,
// 	linearDeflection: number,
// 	angularDeflection: number
// ) {
// 	let _object: Object3D = new Object3D();
// 	withCadException(oc, () => {
// 		console.log('debug start');
// 		debugWithCircle(oc);
// 		console.log('debug done');
// 		// const curve = new oc.Handle_Geom_Curve_2(object);
// 		// console.log('A');
// 		// // const makeEdge = new oc.BRepBuilderAPI_MakeEdge_24(curve);
// 		// // console.log('B');
// 		// // const edge = makeEdge.Edge();
// 		// console.log('C');

// 		// // adaptor
// 		// const adaptor = new oc.GeomAdaptor_Curve_2(curve);
// 		// console.log('D');

// 		// // new oc.GCPnts_UniformAbscissa_2(adaptor, 0.1, 0.1);
// 		// console.log('E 1');
// 		// console.log(adaptor.GetType());
// 		// console.log('E 2');
// 		// const bezierHandle = adaptor.Bezier();
// 		// console.log('e 2');
// 		// console.log(bezierHandle);
// 		// const bezier = bezierHandle.get();
// 		// console.log('E');
// 		// console.log(bezier);

// 		// const pointsCount = bezier.NbPoles();
// 		// console.log('F', {pointsCount});
// 		// const positions: number[] = [];
// 		// for (let i = 0; i < pointsCount; i++) {
// 		// 	console.log(i, i / pointsCount);
// 		// 	const point = bezier.Pole(i / pointsCount);
// 		// 	console.log(point);
// 		// 	positions.push(point.X(), point.Y(), point.Z());
// 		// }

// 		// const geo = new BufferGeometry();
// 		// geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
// 		// // const object = this.createObject(geometry, ObjectType.POINTS);
// 		// // geo.computeVertexNormals();
// 		// return BaseSopOperation.createObject(geo, ObjectType.POINTS, CAD_MATERIAL[ObjectType.POINTS]);

// 		// adaptor.set
// 		// const elspine = new oc.ChFiDS_ElSpine()
// 		// elspine.setCurve(curve)
// 		// adaptor.get

// 		//

// 		// const wireFromEdge = new oc.BRepBuilderAPI_MakeWire_2(edge);
// 		// const wire = wireFromEdge.Wire();
// 		// // const mkWire = new oc.BRepBuilderAPI_MakeWire_1();
// 		// // mkWire.Add_2(wire.Wire());

// 		// // const path = [
// 		// // 	[-1, 0, 0],
// 		// // 	[1, 0, 0],
// 		// // 	[1, 2, 0],
// 		// // ].map(([x, y, z]) => new oc.gp_Pnt_3(x, y, z));
// 		// // const makePolygon = new oc.BRepBuilderAPI_MakePolygon_3(path[0], path[1], path[2], true);
// 		// // const wire = makePolygon.Wire();
// 		// const f = new oc.BRepBuilderAPI_MakeFace_15(wire, true);
// 		// const shape = f.Shape();
// 		// console.log({object});
// 		// return cadShapeToObject3D({oc, object: shape, linearDeflection, angularDeflection, traverseEdgesIfNoTris: true});
// 	});
// 	return _object;
// }
