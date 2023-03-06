/**
 * trims input CAD curves
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadGeometryType, CadNumberHandle, _createCadNumberHandle} from '../../../core/geometry/cad/CadCommon';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {CoreGroup} from '../../../core/geometry/Group';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const v0: CadNumberHandle = _createCadNumberHandle();
const v1: CadNumberHandle = _createCadNumberHandle();
// TODO: normalize range?
class CADCurveTrimSopParamsConfig extends NodeParamsConfig {
	/** @param min */
	min = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [false, false],
		step,
	});
	/** @param max */
	max = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
		step,
	});
}
const ParamsConfig = new CADCurveTrimSopParamsConfig();

export class CADCurveTrimSopNode extends CADSopNode<CADCurveTrimSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CURVE_TRIM;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCoreGroup = inputCoreGroups[0];

		const inputObjects = inputCoreGroup.cadObjects();
		const newObjects: CadObject<CadGeometryType>[] = [];
		if (inputObjects) {
			for (let inputObject of inputObjects) {
				if (CoreCadType.isGeom2dCurve(inputObject)) {
					const curve = inputObject.cadGeometry();
					const handle = new oc.Handle_Geom2d_Curve_2(curve);
					const trimmedCurve = new oc.Geom2d_TrimmedCurve(handle, this.pv.min, this.pv.max, true, true);
					console.log({trimmedCurve});
					newObjects.push(new CadObject(trimmedCurve, CadGeometryType.CURVE_2D));
				} else if (CoreCadType.isEdge(inputObject)) {
					const edge = inputObject.cadGeometry();
					oc.BRep_Tool.Range_1(edge, v0 as any, v1 as any);
					const handle = oc.BRep_Tool.Curve_2(edge, v0.current, v1.current);
					const trimmedCurve = new oc.Geom_TrimmedCurve(handle, this.pv.min, this.pv.max, true, true);
					const newEdge = cadEdgeCreate(oc, trimmedCurve);
					newObjects.push(new CadObject(newEdge, CadGeometryType.EDGE));
				}
			}
		}
		this.setCADObjects(newObjects);
	}
}
