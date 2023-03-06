/**
 * Creates a CAD 2D bezier.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {gp_Pnt2d} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';

class CADBezier2DSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CADBezier2DSopParamsConfig();

export class CADBezier2DSopNode extends CADSopNode<CADBezier2DSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_BEZIER_2D;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const cadObjects = inputCoreGroups[0].cadObjects();

		const points: gp_Pnt2d[] = [];
		if (cadObjects) {
			for (let object of cadObjects) {
				if (CoreCadType.isPoint2d(object)) {
					points.push(object.cadGeometry());
				}
			}
		}
		if (points.length >= 3) {
			const oc = await CadLoader.core();

			const positions = new oc.TColgp_Array1OfPnt2d_2(0, points.length - 1);
			console.log('size', positions.Size());
			let index = 0;
			for (let point of points) {
				positions.SetValue(index, point);
				index++;
			}

			const bezier = new oc.Geom2d_BezierCurve_1(positions);
			// const curve = circle3Points.Value().get();
			console.log({bezier});
			this.setCADGeom2dCurve(bezier);
		} else {
			this.setCADObjects([]);
		}
	}
}
