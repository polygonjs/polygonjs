/**
 * Transforms a tile along the north/south, west/east and bottom/top axis.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Matrix4, Vector3, Quaternion} from 'three';

const _m4 = new Matrix4();
const _t = new Vector3();
const _q = new Quaternion();
const _s = new Vector3(1, 1, 1);
const UP = new Vector3(0, 1, 0);

class WFCTileTransformSopParamsConfig extends NodeParamsConfig {
	/** @param south / north  */
	sn = ParamConfig.INTEGER(0, {
		range: [-2, 2],
		rangeLocked: [true, true],
	});
	/** @param west / east */
	we = ParamConfig.INTEGER(0, {
		range: [-2, 2],
		rangeLocked: [true, true],
	});
	/** @param bottom / top */
	bt = ParamConfig.INTEGER(0, {
		range: [-2, 2],
		rangeLocked: [true, true],
	});
	/** @param y rotation */
	ry = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new WFCTileTransformSopParamsConfig();

export class WFCTileTransformSopNode extends TypedSopNode<WFCTileTransformSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_TRANSFORM;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.allObjects();

		_t.set(this.pv.sn, this.pv.bt, this.pv.we);
		_q.setFromAxisAngle(UP, Math.PI * this.pv.ry * 0.5);
		_m4.compose(_t, _q, _s);
		for (const object of objects) {
			object.applyMatrix4(_m4);
		}

		this.setCoreGroup(coreGroup);
	}
}
