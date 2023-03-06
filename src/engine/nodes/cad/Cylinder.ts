// /**
//  * Creates a cylinder.
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

// class CylinderCadParamsConfig extends NodeParamsConfig {
// 	/** @param radius */
// 	radius = ParamConfig.FLOAT(1, {
// 		range: [0, 2],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param height */
// 	height = ParamConfig.FLOAT(1, {
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
// 	/** @param angle */
// 	angle = ParamConfig.FLOAT(`2*$PI`, {
// 		range: [0, 2 * Math.PI],
// 		rangeLocked: [true, true],
// 		step,
// 		visibleIf: {closed: false},
// 	});
// }
// const ParamsConfig = new CylinderCadParamsConfig();

// export class CylinderCadNode extends TypedCadNode<CylinderCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return CadType.CYLINDER;
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();
// 		const axis = cadAxis(this.pv.axis);

// 		const api = this.pv.closed
// 			? new oc.BRepPrimAPI_MakeCylinder_3(axis, this.pv.radius, this.pv.height)
// 			: new oc.BRepPrimAPI_MakeCylinder_4(axis, this.pv.radius, this.pv.height, this.pv.angle);

// 		const shape = cadShapeTranslate(api.Shape(), this.pv.center);

// 		this.setShell(shape);
// 	}
// }
