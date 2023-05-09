// /**
//  * Creates an SDF sphere.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {step} from '../../../core/geometry/sdf/SDFConstant';
// import {SDFLoader} from '../../../core/geometry/sdf/SDFLoader';
// import {Number3} from '../../../types/GlobalTypes';

// const _centerN3: Number3 = [0, 0, 0];
// class SDFSphereSopParamsConfig extends NodeParamsConfig {
// 	/** @param radius */
// 	radius = ParamConfig.FLOAT(1, {
// 		range: [0, 2],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param resulution */
// 	resolution = ParamConfig.INTEGER(64, {
// 		range: [1, 128],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param center */
// 	center = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new SDFSphereSopParamsConfig();

// export class SDFSphereSopNode extends SDFSopNode<SDFSphereSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_SPHERE;
// 	}

// 	override async cook() {
// 		const manifold = await SDFLoader.core();
// 		this.pv.center.toArray(_centerN3);
// 		const geometry = manifold.sphere(this.pv.radius, this.pv.resolution);
// 		const centered = geometry.translate(_centerN3);
// 		this.setSDFGeometry(centered);
// 	}
// }
