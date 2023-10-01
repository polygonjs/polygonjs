// /**
//  * Creates an SDF tube.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {step} from '../../../core/geometry/modules/sdf/SDFConstant';
// import {SDFLoader} from '../../../core/geometry/modules/sdf/SDFLoader';
// import {Number3} from '../../../types/GlobalTypes';

// const _centerN3: Number3 = [0, 0, 0];

// class SDFTubeSopParamsConfig extends NodeParamsConfig {
// 	/** @param top radius */
// 	radiusTop = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param bottom radius */
// 	radiusBottom = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param tube height */
// 	height = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param number of segments in the radial direction */
// 	segmentsRadial = ParamConfig.INTEGER(32, {
// 		range: [3, 128],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param center */
// 	center = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new SDFTubeSopParamsConfig();

// export class SDFTubeSopNode extends SDFSopNode<SDFTubeSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_TUBE;
// 	}

// 	override async cook() {
// 		const manifold = await SDFLoader.core();
// 		this.pv.center.toArray(_centerN3);
// 		const geometry = manifold.cylinder(
// 			this.pv.height,
// 			this.pv.radiusBottom,
// 			this.pv.radiusTop,
// 			this.pv.segmentsRadial
// 		);
// 		const centered = geometry.translate(_centerN3);
// 		this.setSDFGeometry(centered);
// 	}
// }
