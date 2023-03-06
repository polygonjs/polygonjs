// /**
//  * Creates a 2D point.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CadType} from '../../poly/registers/nodes/types/Cad';

// class Point2DCadParamsConfig extends NodeParamsConfig {
// 	/** @param center */
// 	center = ParamConfig.VECTOR2([0, 0]);
// }
// const ParamsConfig = new Point2DCadParamsConfig();

// export class Point2DCadNode extends TypedCadNode<Point2DCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return CadType.POINT_2D;
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();

// 		const point = new oc.gp_Pnt2d_3(this.pv.center.x, this.pv.center.y);

// 		this.setPoint2D(point);
// 	}
// }
