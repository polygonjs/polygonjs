/**
 * Sets which node is used as the output of a parent subnet node.
 *
 * @remarks
 * Can only be created inside a subnet ANIM node.
 *
 */
import {TypedAnimNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType} from '../../poly/NodeContext';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
class SubnetOutputSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputSopParamsConfig();

export class SubnetOutputAnimNode extends TypedAnimNode<SubnetOutputSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.outputs.setHasNoOutput();

		this.lifecycle.onAfterAdded(this._setParentDirtyBound);
		this.addPostDirtyHook('makeParentDirty', this._setParentDirtyBound);
	}
	override dispose() {
		super.dispose();
		this._setParentDirty();
	}

	override cook(inputContents: TimelineBuilder[]) {
		const timelineBuilder = inputContents[0];
		this.setTimelineBuilder(timelineBuilder);
	}

	private _setParentDirtyBound = this._setParentDirty.bind(this);
	private _setParentDirty() {
		this.parent()?.setDirty();
	}
}
