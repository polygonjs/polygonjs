/**
 * Fetches the input from a parent subnet node.
 *
 * @remarks
 * Can only be created inside a subnet SOP.
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {NetworkChildNodeType} from '../../poly/NodeContext';
class SubnetInputSopParamsConfig extends NodeParamsConfig {
	/** @param sets which input of the parent subnet node is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			SubnetInputSopNode.PARAM_CALLBACK_reset(node as SubnetInputSopNode);
		},
	});
}
const ParamsConfig = new SubnetInputSopParamsConfig();

export class SubnetInputSopNode extends TypedSopNode<SubnetInputSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkChildNodeType.INPUT;
	}

	private _currentParentInputGraphNode: CoreGraphNode | undefined;

	override initializeNode() {
		this.io.inputs.setCount(0);

		this.lifecycle.onAfterAdded(() => {
			this._setParentInputDependency();
		});
	}

	override async cook() {
		const inputIndex = this.pv.input;
		const parent = this.parent();
		if (!parent) {
			this.states.error.set(`subnet input has no parent`);
			return this.cookController.endCook();
		}
		if (!parent.io.inputs.hasInput(inputIndex)) {
			this.states.error.set(`parent has no input ${inputIndex}`);
			return this.cookController.endCook();
		}
		const container = await parent.containerController.requestInputContainer(inputIndex);
		if (!container) {
			this.states.error.set(`input invalid ${inputIndex}`);
			return this.cookController.endCook();
		}
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.states.error.set(`input invalid ${inputIndex}`);
			return this.cookController.endCook();
		}
		this.setCoreGroup(coreGroup);
	}

	static PARAM_CALLBACK_reset(node: SubnetInputSopNode) {
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
