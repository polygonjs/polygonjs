/**
 * Transform 2D points and curves
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
import {CadObjectType, gp_Pnt2d, Geom2d_Curve} from '../../../core/geometry/cad/CadCommon';
import {cadGeom2dCurveTransform} from '../../../core/geometry/cad/toObject3D/CadGeom2dCurve';
import {cadPnt2dTransform} from '../../../core/geometry/cad/toObject3D/CadPnt2d';
import {CadType} from '../../poly/registers/nodes/types/Cad';
import {Vector2} from 'three';

class Transform2DCadParamsConfig extends NodeParamsConfig {
	/** @param translate */
	t = ParamConfig.VECTOR2([0, 0]);
	/** @param rotation */
	r = ParamConfig.FLOAT(0, {
		range: [-180, 180],
		rangeLocked: [false, false],
	});
	/** @param scale (as a float) */
	s = ParamConfig.FLOAT(1, {
		range: [0, 2],
		step: 0.01,
	});
}
const ParamsConfig = new Transform2DCadParamsConfig();

export class Transform2DCadNode extends TypedCadNode<Transform2DCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): CadType.TRANSFORM_2D {
		return CadType.TRANSFORM_2D;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];

		const objects = coreGroup0.objects();
		for (let object of objects) {
			transform2D(object, this.pv.t, this.pv.r, this.pv.s);
		}

		this.setCadObjects(objects);
	}
}

function transform2D(coreObject: CadCoreObject<CadObjectType>, t: Vector2, r: number, s: number) {
	switch (coreObject.type()) {
		case CadObjectType.POINT_2D: {
			return cadPnt2dTransform(coreObject.object() as gp_Pnt2d, t);
		}
		case CadObjectType.CURVE_2D: {
			return cadGeom2dCurveTransform(coreObject.object() as Geom2d_Curve, t, r, s);
		}
	}
}
