/**
 * trims input curves
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
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';

const v0 = {current: 0};
const v1 = {current: 0};
// TODO: normalize range?
class CurveTrimCadParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new CurveTrimCadParamsConfig();

export class CurveTrimCadNode extends TypedCadNode<CurveTrimCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'curveTrim';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCoreGroup = inputCoreGroups[0];

		const inputObjects = inputCoreGroup.objects();
		const newObjects: CadCoreObject<CadObjectType>[] = [];
		for (let inputObject of inputObjects) {
			if (CoreCadType.isGeom2dCurve(inputObject)) {
				const curve = inputObject.object();
				const handle = new oc.Handle_Geom2d_Curve_2(curve);
				const trimmedCurve = new oc.Geom2d_TrimmedCurve(handle, this.pv.min, this.pv.max, true, true);
				console.log({trimmedCurve});
				newObjects.push(new CadCoreObject(trimmedCurve, CadObjectType.CURVE_2D));
			} else if (CoreCadType.isEdge(inputObject)) {
				const edge = inputObject.object();
				oc.BRep_Tool.Range_1(edge, v0 as any, v1 as any);
				const handle = oc.BRep_Tool.Curve_2(edge, v0.current, v1.current);
				const trimmedCurve = new oc.Geom_TrimmedCurve(handle, this.pv.min, this.pv.max, true, true);
				const newEdge = cadEdgeCreate(oc, trimmedCurve);
				newObjects.push(new CadCoreObject(newEdge, CadObjectType.EDGE));
			}
		}

		this.setCadObjects(newObjects);
	}
}
