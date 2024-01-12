/**
 * Creates a BVH from geometries.
 *
 * @remarks
 * BVH allow for faster raycasting
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BVHSopOperation, STRAGERY_MENU_ENTRIES} from '../../operations/sop/BVH';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = BVHSopOperation.DEFAULT_PARAMS;
class BVHSopParamsConfig extends NodeParamsConfig {
	strategy = ParamConfig.INTEGER(DEFAULT.strategy, {
		menu: {
			entries: STRAGERY_MENU_ENTRIES,
		},
	});
	maxDepth = ParamConfig.INTEGER(DEFAULT.maxDepth, {
		range: [1, 128],
		rangeLocked: [true, false],
	});
	maxLeafTris = ParamConfig.INTEGER(DEFAULT.maxLeafTris, {
		range: [1, 16],
		rangeLocked: [true, false],
	});
	compact = ParamConfig.BOOLEAN(DEFAULT.compact);
	verbose = ParamConfig.BOOLEAN(DEFAULT.verbose, {
		visibleIf: {compact: 0},
	});
}
const ParamsConfig = new BVHSopParamsConfig();

export class BVHSopNode extends TypedSopNode<BVHSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.BVH;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(BVHSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BVHSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new BVHSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
