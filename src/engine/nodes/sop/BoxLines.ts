/**
 * Creates a box made of lines.
 *
 * @remarks
 * What this node creates is different than a box mesh with a wireframe material applied, in the sense that this will not create triangles.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BoxLinesSopOperation} from '../../operations/sop/BoxLines';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = BoxLinesSopOperation.DEFAULT_PARAMS;
class BoxLinesSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.FLOAT(DEFAULT.size);
	/** @param sizes on each axis */
	sizes = ParamConfig.VECTOR3(DEFAULT.sizes);
	/** @param divisions on each axis */
	divisions = ParamConfig.VECTOR3(DEFAULT.divisions);
	/** @param center of the geometry */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new BoxLinesSopParamsConfig();

export class BoxLinesSopNode extends TypedSopNode<BoxLinesSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'boxLines';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(BoxLinesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BoxLinesSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new BoxLinesSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
