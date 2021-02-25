// import {Constructor} from '../../../../types/GlobalTypes';
// import {BaseController} from './_BaseController';
// import {FrontSide} from 'three/src/constants';
// import {DoubleSide, BackSide, FrontSide} from 'three/src/constants';
// import {BackSide} from 'three/src/constants';
// import {Material} from 'three/src/materials/Material';
// import {TypedMatNode} from '../_Base';

// import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
// import {isBooleanTrue} from '../../../../core/BooleanValue';
// export function SideParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 	};
// }

// class SidedMaterial extends Material {
// 	side!: number;
// }
// class SideParamsConfig extends SideParamConfig(NodeParamsConfig) {}
// class SideMatNode extends TypedMatNode<SidedMaterial, SideParamsConfig> {
// 	createMaterial() {
// 		return new SidedMaterial();
// 	}
// }

// export class SideController extends BaseController {
// 	constructor(protected node: SideMatNode) {
// 		super(node);
// 	}
// 	static update(node: SideMatNode) {
// 		const single_side = isBooleanTrue(node.pv.front) ? FrontSide : BackSide;
// 		const new_side = isBooleanTrue(node.pv.doubleSided) ? DoubleSide : single_side;
// 		const mat = node.material;
// 		if (new_side != mat.side) {
// 			mat.side = new_side;
// 			mat.needsUpdate = true;
// 		}
// 	}
// }
