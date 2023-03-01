import type {OpenCascadeInstance, TopoDS_Edge} from './CadCommon';
import type {EdgeData} from './CadCommon';

interface EdgeDataOptions {
	oc: OpenCascadeInstance;
	edge: TopoDS_Edge;
	abscissa: number;
	tolerance: 0.1;
}
export function edgeData(options: EdgeDataOptions): EdgeData | void {
	const {oc, edge, abscissa, tolerance} = options;
	const adaptor = new oc.BRepAdaptor_Curve_2(edge);

	const uniformAbscissa = new oc.GCPnts_UniformAbscissa_1();
	uniformAbscissa.Initialize_1(adaptor, abscissa, tolerance);

	// adaptor.

	if (uniformAbscissa.IsDone()) {
	}
}
