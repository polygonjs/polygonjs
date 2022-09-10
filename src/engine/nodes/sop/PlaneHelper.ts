/**
 * Creates a plane.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {PlaneHelperSopOperation} from '../../operations/sop/PlaneHelper';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Number3} from '../../../types/GlobalTypes';
const DEFAULT = PlaneHelperSopOperation.DEFAULT_PARAMS;
class PlaneHelperSopParamsConfig extends NodeParamsConfig {
	/** @param size of the plane */
	size = ParamConfig.FLOAT(DEFAULT.size, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param colorCenterLine */
	colorCenterLine = ParamConfig.COLOR(DEFAULT.colorCenterLine.toArray() as Number3);
	/** @param colorGrid */
	colorGrid = ParamConfig.COLOR(DEFAULT.colorGrid.toArray() as Number3);
}
const ParamsConfig = new PlaneHelperSopParamsConfig();

export class PlaneHelperSopNode extends TypedSopNode<PlaneHelperSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'planeHelper';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: PlaneHelperSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PlaneHelperSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
