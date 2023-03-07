// /**
//  * Center the input geometry
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import type {maths} from '@jscad/modeling';
// import {transforms} from '@jscad/modeling';
// import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
// const {center} = transforms;

// class CenterCsgParamsConfig extends NodeParamsConfig {
// 	/** @param x */
// 	x = ParamConfig.BOOLEAN(1);
// 	/** @param y */
// 	y = ParamConfig.BOOLEAN(1);
// 	/** @param z */
// 	z = ParamConfig.BOOLEAN(1);
// 	/** @param relativeTo */
// 	relativeTo = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new CenterCsgParamsConfig();

// export class CenterCsgNode extends TypedCsgNode<CenterCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'center';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	private _relativeTo: maths.vec3.Vec3 = [0, 0, 0];
// 	private _axes: [boolean, boolean, boolean] = [true, true, true];
// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		vector3ToCsgVec3(this.pv.relativeTo, this._relativeTo);
// 		this._axes[0] = this.pv.x;
// 		this._axes[1] = this.pv.y;
// 		this._axes[2] = this.pv.z;
// 		const options: transforms.CenterOptions = {
// 			axes: this._axes,
// 			relativeTo: this._relativeTo,
// 		};
// 		const objects = inputCoreGroups[0].objects().map((o) => center(options, o));
// 		this.setCsgCoreObjects(objects);
// 	}
// }
