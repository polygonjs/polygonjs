/**
 * create points from a curve
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadObjectType} from '../../../core/geometry/cad/CadCommon';
import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
import {Vector3} from 'three';

const v0 = {current: 0};
const v1 = {current: 0};
const tmpV3 = new Vector3();

class CurvePointsCadParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new CurvePointsCadParamsConfig();

export class CurvePointsCadNode extends TypedCadNode<CurvePointsCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'curvePoints';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCoreGroup = inputCoreGroups[0];

		const inputObjects = inputCoreGroup.objects();
		const newObjects: CadCoreObject<CadObjectType>[] = [];
		const {min, max, count} = this.pv;
		const delta = max - min;
		for (let inputObject of inputObjects) {
			if (CoreCadType.isGeom2dCurve(inputObject)) {
				const curve = inputObject.object();

				for (let i = 0; i < count; i++) {
					const d0 = min + delta * (i / count);
					const pt = new oc.gp_Pnt2d_1();
					curve.D0(d0, pt);
					newObjects.push(new CadCoreObject(pt, CadObjectType.POINT_2D));
				}
			} else if (CoreCadType.isEdge(inputObject)) {
				const edge = inputObject.object();
				console.log(edge);
				oc.BRep_Tool.Range_1(edge, v0 as any, v1 as any);
				const handle = oc.BRep_Tool.Curve_2(edge, v0.current, v1.current);
				console.log(handle);
				const curve = handle.get();
				console.log(curve);
				const pt = new oc.gp_Pnt_1();

				for (let i = 0; i < count; i++) {
					const d0 = min + delta * (i / count);
					curve.D0(d0, pt);
					tmpV3.set(pt.X(), pt.Y(), pt.Z());
					const vertex = cadVertexCreate(oc, tmpV3);
					newObjects.push(new CadCoreObject(vertex, CadObjectType.VERTEX));
				}
			}
		}

		this.setCadObjects(newObjects);
	}
}
