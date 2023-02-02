import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsController} from '../utils/FlagsController';

/**
 *
 *
 * TypedRopNode is the base class for all nodes that process outputs. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */

export class TypedRopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ROP, K> {
	static override context(): NodeContext {
		return NodeContext.ROP;
	}

	public override readonly flags: FlagsController = new FlagsController(this);

	override initializeBaseNode() {
		this.dirtyController.addPostDirtyHook('cook_immediately', () => {
			this.cookController.cookMainWithoutInputs();
		});
	}

	override cook() {
		this.cookController.endCook();
	}
}

export type BaseRopNodeType = TypedRopNode<NodeParamsConfig>;
export class BaseRopNodeClass extends TypedRopNode<NodeParamsConfig> {}
