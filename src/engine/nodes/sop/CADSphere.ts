/**
 * Creates a CAD sphere.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadShapeTranslate} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';
import {cadAxis} from '../../../core/geometry/cad/CadMath';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';

class CADSphereSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});

	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param closed */
	closed = ParamConfig.BOOLEAN(true);
	/** @param thetaMin */
	thetaMin = ParamConfig.FLOAT(`1.5*$PI`, {
		range: [1.5 * Math.PI, 2.5 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {closed: false},
	});
	/** @param thetaMax */
	thetaMax = ParamConfig.FLOAT(`2.5*$PI`, {
		range: [1.5 * Math.PI, 2.5 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {closed: false},
	});
	/** @param phi */
	phi = ParamConfig.FLOAT(`2*$PI`, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {closed: false},
	});
}
const ParamsConfig = new CADSphereSopParamsConfig();

export class CADSphereSopNode extends CADSopNode<CADSphereSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_SPHERE;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const axis = cadAxis(this.pv.axis);
		const api = this.pv.closed
			? new oc.BRepPrimAPI_MakeSphere_9(axis, this.pv.radius)
			: (() => {
					const thetaMin = Math.min(this.pv.thetaMin, this.pv.thetaMax);
					const thetaMax = Math.max(this.pv.thetaMin, this.pv.thetaMax);
					return new oc.BRepPrimAPI_MakeSphere_12(axis, this.pv.radius, thetaMin, thetaMax, this.pv.phi);
			  })();

		const shape = cadShapeTranslate(api.Shape(), this.pv.center);

		this.setCADShape(shape);
	}
}
