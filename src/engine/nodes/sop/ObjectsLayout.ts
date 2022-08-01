/**
 * places input objects in a grid pattern.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectsLayoutSopOperation} from '../../operations/sop/ObjectsLayout';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ObjectsLayoutSopOperation.DEFAULT_PARAMS;
class ObjectsLayoutSopParamConfig extends NodeParamsConfig {
	/** @param layout width */
	maxLayoutWidth = ParamConfig.FLOAT(DEFAULT.maxLayoutWidth, {range: [0, 10]});
	/** @param row height */
	rowHeight = ParamConfig.FLOAT(DEFAULT.rowHeight, {range: [0, 10]});
	/** @param padding between objects */
	padding = ParamConfig.VECTOR2(DEFAULT.padding.toArray());
}
const ParamsConfig = new ObjectsLayoutSopParamConfig();

export class ObjectsLayoutSopNode extends TypedSopNode<ObjectsLayoutSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'objectsLayout';
	}

	static override displayedInputNames(): string[] {
		return ['objects to transform'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ObjectsLayoutSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ObjectsLayoutSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new ObjectsLayoutSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
