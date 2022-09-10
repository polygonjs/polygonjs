/**
 * Creates a box.
 *
 * @remarks
 * If the node has no input, you can control the radius and center of the box. If the node has an input, it will create a box that encompasses the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BoxSopOperation} from '../../operations/sop/Box';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = BoxSopOperation.DEFAULT_PARAMS;
class BoxSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.FLOAT(DEFAULT.size);
	/** @param sizes on each axis */
	sizes = ParamConfig.VECTOR3(DEFAULT.sizes);
	/** @param number of segments on each axis */
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param center of the geometry */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new BoxSopParamsConfig();

export class BoxSopNode extends TypedSopNode<BoxSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'box';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(BoxSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BoxSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new BoxSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
