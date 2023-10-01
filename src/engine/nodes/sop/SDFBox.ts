// /**
//  * Creates an SDF box.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {step} from '../../../core/geometry/modules/sdf/SDFConstant';
// import {SDFLoader} from '../../../core/geometry/modules/sdf/SDFLoader';
// import {Number3} from '../../../types/GlobalTypes';
// import {Vector3} from 'three';

// const _size: Vector3 = new Vector3();
// const _sizeN3: Number3 = [0, 0, 0];
// const _centerN3: Number3 = [0, 0, 0];

// class SDFBoxSopParamsConfig extends NodeParamsConfig {
// 	/** @param size */
// 	size = ParamConfig.FLOAT(1, {
// 		range: [0, 10],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// 	/** @param sizes */
// 	sizes = ParamConfig.VECTOR3([1, 1, 1]);
// 	/** @param center */
// 	center = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new SDFBoxSopParamsConfig();

// export class SDFBoxSopNode extends SDFSopNode<SDFBoxSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_BOX;
// 	}

// 	override async cook() {
// 		const manifold = await SDFLoader.core();
// 		_size.copy(this.pv.sizes).multiplyScalar(this.pv.size).toArray(_sizeN3);
// 		this.pv.center.toArray(_centerN3);
// 		const geometry = manifold.cube(_sizeN3, true);
// 		const centered = geometry.translate(_centerN3);
// 		this.setSDFGeometry(centered);
// 	}
// }
