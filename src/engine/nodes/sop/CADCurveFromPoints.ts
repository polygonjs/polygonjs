/**
 * Creates a CAD 3D bezier.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TopoDS_Shape, TopoDS_Edge, gp_Pnt, CadGC} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
// import {withCadException} from '../../../core/geometry/cad/CadExceptionHandler';

class CADCurveFromPointsSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CADCurveFromPointsSopParamsConfig();

export class CADCurveFromPointsSopNode extends CADSopNode<CADCurveFromPointsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CURVE_FROM_POINTS;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const objects = inputCoreGroups[0].cadObjects();

		const vertices: TopoDS_Shape[] = [];
		if (objects) {
			for (let object of objects) {
				if (CoreCadType.isVertex(object)) {
					vertices.push(object.cadGeometry());
				}
			}
		}
		if (vertices.length >= 3) {
			const oc = CadLoaderSync.oc();

			CadGC.withGC((r) => {
				const positions = r(new oc.TColgp_Array1OfPnt_2(0, vertices.length - 1));
				const points: gp_Pnt[] = [];
				let index = 0;
				for (let vertex of vertices) {
					const point = oc.BRep_Tool.Pnt(vertex);
					points.push(point);
					console.log(point);
					positions.SetValue(index, point);
					index++;
				}

				const _createBezier: () => TopoDS_Edge = () => {
					const curve = r(new oc.Geom_BezierCurve_1(positions));
					const edge = cadEdgeCreate(oc, curve);
					return edge;
				};
				// const _createSpline = () => {
				// 	const edge = withCadException<TopoDS_Edge>(oc, () => {
				// 		console.log({positions}, positions.Lower(), positions.Upper());
				// 		// console.log(oc.BitByBitDev, oc.BitByBitDev.BitInterpolate);
				// 		// const splineHandle = oc.BitByBitDev.BitInterpolate(positions, false, 0.001);
				// 		const interp = oc.GeomAPI_Interpolate()
				// 		console.log('A');
				// 		// console.log({curveHandle});
				// 		// const spline = splineHandle.get();
				// 		console.log('spline');
				// 		const curveHandle =  CadGC.r(new oc.Handle_Geom_Curve_2(spline));
				// 		const curve = curveHandle.get();
				// 		// const curve =  CadGC.r(new oc.Geom_BezierCurve_1(positions));
				// 		if (curve) {
				// 			const edge = cadEdgeCreate(oc, curve);
				// 			return edge as TopoDS_Edge;
				// 		} else {
				// 			console.warn('no curve');
				// 		}
				// 	});
				// 	return edge;
				// };
				const createFunction = _createBezier;
				const edge = createFunction();

				for (let point of points) {
					point.delete();
				}

				// this.setCADObjects([]);
				if (edge) {
					this.setCADShape(edge);
				} else {
					this.setCADObjects([]);
				}
			});
		} else {
			this.setCADObjects([]);
		}
	}
}
