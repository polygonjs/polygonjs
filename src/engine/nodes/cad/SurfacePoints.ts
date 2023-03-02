/**
 * create points from a surface
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CadObjectType, TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
import {Vector3} from 'three';

const tmpV3 = new Vector3();

class SurfacePointsCadParamsConfig extends NodeParamsConfig {
	/** @param points count */
	countU = ParamConfig.INTEGER(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		step,
	});
	/** @param min */
	minU = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [false, false],
		step,
	});
	/** @param max */
	maxU = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
		step,
	});
	/** @param points count */
	countV = ParamConfig.INTEGER(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		step,
	});
	/** @param min */
	minV = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [false, false],
		step,
	});
	/** @param max */
	maxV = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
		step,
	});
}
const ParamsConfig = new SurfacePointsCadParamsConfig();

export class SurfacePointsCadNode extends TypedCadNode<SurfacePointsCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'surfacePoints';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const inputShapes = inputCoreGroups[0].objects().filter((o) => CoreCadType.isShape(o));

		const newObjects: CadCoreObject<CadObjectType>[] = [];

		const {minU, maxU, countU, minV, maxV, countV} = this.pv;
		const deltaU = maxU - minU;
		const deltaV = maxV - minV;

		const pt = new oc.gp_Pnt_1();
		for (let inputShape of inputShapes) {
			const shape = inputShape.object() as TopoDS_Shape;

			const surface = new oc.BRepLib_FindSurface_2(shape, 0, false, false).Surface().get();

			for (let ui = 0; ui < countU; ui++) {
				const d0u = minU + deltaU * (ui / countU);
				for (let vi = 0; vi < countV; vi++) {
					const d0v = minV + deltaV * (vi / countV);
					surface.D0(d0u, d0v, pt);
					tmpV3.set(pt.X(), pt.Y(), pt.Z());
					const vertex = cadVertexCreate(oc, tmpV3);
					newObjects.push(new CadCoreObject(vertex, CadObjectType.VERTEX));
				}
			}
		}

		console.log({newObjects});
		this.setCadObjects(newObjects);
	}
}
