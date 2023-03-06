// /**
//  * Creates a point.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
// import {CadType} from '../../poly/registers/nodes/types/Cad';

// class PointCadParamsConfig extends NodeParamsConfig {
// 	/** @param translate */
// 	center = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new PointCadParamsConfig();

// export class PointCadNode extends TypedCadNode<PointCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return CadType.POINT;
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();
// 		const vertex = cadVertexCreate(oc, this.pv.center);
// 		this.setVertex(vertex);
// 	}
// }
