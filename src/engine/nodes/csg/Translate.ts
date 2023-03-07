// /**
//  * Translate the input geometry
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import type {maths} from '@jscad/modeling';
// import {transforms} from '@jscad/modeling';
// import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
// const {translate} = transforms;

// class TranslateCsgParamsConfig extends NodeParamsConfig {
// 	/** @param translate */
// 	t = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new TranslateCsgParamsConfig();

// export class TranslateCsgNode extends TypedCsgNode<TranslateCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'translate';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	private _t: maths.vec3.Vec3 = [0, 0, 0];
// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		vector3ToCsgVec3(this.pv.t, this._t);
// 		const objects = inputCoreGroups[0].objects().map((o) => translate(this._t, o));
// 		this.setCsgCoreObjects(objects);
// 	}
// }
