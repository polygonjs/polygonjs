/**
 * Fetches the input from a parent subnet node.
 *
 * @remarks
 * Can only be created inside a subnet ANIM node.
 *
 */
import {TypedAnimNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {NetworkChildNodeType} from '../../poly/NodeContext';
class SubnetInputAnimParamsConfig extends NodeParamsConfig {
	/** @param sets which input of the parent subnet node is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			SubnetInputAnimNode.PARAM_CALLBACK_reset(node as SubnetInputAnimNode);
		},
	});
}
const ParamsConfig = new SubnetInputAnimParamsConfig();

export class SubnetInputAnimNode extends TypedAnimNode<SubnetInputAnimParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return NetworkChildNodeType.INPUT;
	}

	private _currentParentInputGraphNode: CoreGraphNode | undefined;

	initializeNode() {
		this.io.inputs.setCount(0);

		this.lifecycle.onAfterAdded(() => {
			this._setParentInputDependency();
		});
	}

	async cook() {
		const input_index = this.pv.input;
		const parent = this.parent();
		if (parent) {
			if (parent.io.inputs.hasInput(input_index)) {
				const container = await parent.containerController.requestInputContainer(input_index);
				if (container) {
					const timelineBuilder = container.coreContent();
					if (timelineBuilder) {
						this.setTimelineBuilder(timelineBuilder);
						return;
					}
				}
			} else {
				this.states.error.set(`parent has no input ${input_index}`);
			}
			this.cookController.endCook();
		} else {
			this.states.error.set(`subnet input has no parent`);
		}
	}

	static PARAM_CALLBACK_reset(node: SubnetInputAnimNode) {
		node._setParentInputDependency();
	}
	private _setParentInputDependency() {
		if (this._currentParentInputGraphNode) {
			this.removeGraphInput(this._currentParentInputGraphNode);
		}

		const parent = this.parent();
		if (parent) {
			this._currentParentInputGraphNode = parent.io.inputs.inputGraphNode(this.pv.input);
			this.addGraphInput(this._currentParentInputGraphNode);
		}
	}
}
