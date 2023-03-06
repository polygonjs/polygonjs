/**
 * Transform 2D points and curves
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadGeometryType, gp_Pnt2d, Geom2d_Curve} from '../../../core/geometry/cad/CadCommon';
import {cadGeom2dCurveTransform} from '../../../core/geometry/cad/toObject3D/CadGeom2dCurve';
import {cadPnt2dTransform} from '../../../core/geometry/cad/toObject3D/CadPnt2d';
import {Vector2} from 'three';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {CadObject} from '../../../core/geometry/cad/CadObject';

class CADTransform2DSopParamsConfig extends NodeParamsConfig {
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
	/** @param pivot */
	pivot = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CADTransform2DSopParamsConfig();

export class CADTransform2DSopNode extends CADSopNode<CADTransform2DSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): SopType.CAD_TRANSFORM_2D {
		return SopType.CAD_TRANSFORM_2D;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];

		const newObjects: CadObject<CadGeometryType>[] = [];
		const cadObjects = coreGroup0.cadObjects();
		if (cadObjects) {
			for (let cadObject of cadObjects) {
				transform2D(cadObject, this.pv.t, this.pv.r, this.pv.s, this.pv.pivot);
				newObjects.push(cadObject);
			}
		}

		this.setCADObjects(newObjects);
	}
}

function transform2D(cadObject: CadObject<CadGeometryType>, t: Vector2, r: number, s: number, pivot: Vector2) {
	switch (cadObject.type) {
		case CadGeometryType.POINT_2D: {
			return cadPnt2dTransform(cadObject.cadGeometry() as gp_Pnt2d, t);
		}
		case CadGeometryType.CURVE_2D: {
			return cadGeom2dCurveTransform(cadObject.cadGeometry() as Geom2d_Curve, t, r, s, pivot);
		}
	}
}
