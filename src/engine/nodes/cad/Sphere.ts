// /**
//  * Creates a sphere.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {step} from '../../../core/geometry/csg/CsgUiUtils';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CadType} from '../../poly/registers/nodes/types/Cad';
// import {cadShapeTranslate} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';
// import {cadAxis} from '../../../core/geometry/cad/CadMath';

// class SphereCadParamsConfig extends NodeParamsConfig {
// 	/** @param radius */
// 	radius = ParamConfig.FLOAT(1, {
// 		range: [0, 2],
// 		rangeLocked: [true, false],
// 		step,
// 	});

// 	/** @param center */
// 	center = ParamConfig.VECTOR3([0, 0, 0]);
// 	/** @param axis */
// 	axis = ParamConfig.VECTOR3([0, 1, 0]);
// 	/** @param closed */
// 	closed = ParamConfig.BOOLEAN(true);
// 	/** @param thetaMin */
// 	thetaMin = ParamConfig.FLOAT(`1.5*$PI`, {
// 		range: [1.5 * Math.PI, 2.5 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 		visibleIf: {closed: false},
// 	});
// 	/** @param thetaMax */
// 	thetaMax = ParamConfig.FLOAT(`2.5*$PI`, {
// 		range: [1.5 * Math.PI, 2.5 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 		visibleIf: {closed: false},
// 	});
// 	/** @param phi */
// 	phi = ParamConfig.FLOAT(`2*$PI`, {
// 		range: [0, 2 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 		visibleIf: {closed: false},
// 	});
// }
// const ParamsConfig = new SphereCadParamsConfig();

// export class SphereCadNode extends TypedCadNode<SphereCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return CadType.SPHERE;
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();
// 		const axis = cadAxis(this.pv.axis);
// 		const api = this.pv.closed
// 			? new oc.BRepPrimAPI_MakeSphere_9(axis, this.pv.radius)
// 			: (() => {
// 					const thetaMin = Math.min(this.pv.thetaMin, this.pv.thetaMax);
// 					const thetaMax = Math.max(this.pv.thetaMin, this.pv.thetaMax);
// 					return new oc.BRepPrimAPI_MakeSphere_12(axis, this.pv.radius, thetaMin, thetaMax, this.pv.phi);
// 			  })();

// 		const shape = cadShapeTranslate(api.Shape(), this.pv.center);

// 		this.setShell(shape);
// 	}
// }
