/**
 * create CAD points from a CAD curve
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadGeometryType, CadNumberHandle, _createCadNumberHandle} from '../../../core/geometry/cad/CadCommon';
import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
import {Vector3} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/cad/CadObject';

const v0: CadNumberHandle = _createCadNumberHandle();
const v1: CadNumberHandle = _createCadNumberHandle();
const tmpV3 = new Vector3();
// TODO: normalize range?

class CADCurvePointsSopParamsConfig extends NodeParamsConfig {
	/** @param points count */
	count = ParamConfig.INTEGER(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		step,
	});
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
const ParamsConfig = new CADCurvePointsSopParamsConfig();

export class CADCurvePointsSopNode extends CADSopNode<CADCurvePointsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CURVE_POINTS;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCoreGroup = inputCoreGroups[0];

		const inputObjects = inputCoreGroup.cadObjects();
		const newObjects: CadObject<CadGeometryType>[] = [];
		const {min, max, count} = this.pv;
		const delta = max - min;
		if (inputObjects) {
			for (let inputObject of inputObjects) {
				if (CoreCadType.isGeom2dCurve(inputObject)) {
					const curve = inputObject.cadGeometry();

					for (let i = 0; i < count; i++) {
						const d0 = min + delta * (i / count);
						const pt = new oc.gp_Pnt2d_1();
						curve.D0(d0, pt);
						newObjects.push(new CadObject(pt, CadGeometryType.POINT_2D));
					}
				} else if (CoreCadType.isEdge(inputObject)) {
					const edge = inputObject.cadGeometry();
					oc.BRep_Tool.Range_1(edge, v0 as any, v1 as any);
					const handle = oc.BRep_Tool.Curve_2(edge, v0.current, v1.current);
					const curve = handle.get();
					const pt = new oc.gp_Pnt_1();

					for (let i = 0; i < count; i++) {
						const d0 = min + delta * (i / count);
						curve.D0(d0, pt);
						tmpV3.set(pt.X(), pt.Y(), pt.Z());
						const vertex = cadVertexCreate(oc, tmpV3);
						newObjects.push(new CadObject(vertex, CadGeometryType.VERTEX));
					}
				}
			}
		}

		this.setCADObjects(newObjects);
	}
}
