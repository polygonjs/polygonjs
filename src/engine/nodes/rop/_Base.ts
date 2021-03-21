import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsController} from '../utils/FlagsController';

export class TypedRopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ROP, K> {
	static nodeContext(): NodeContext {
		return NodeContext.ROP;
	}

	public readonly flags: FlagsController = new FlagsController(this);

	initializeBaseNode() {
		this.dirtyController.addPostDirtyHook('cook_immediately', () => {
			this.cookController.cook_main_without_inputs();
		});
	}

	cook() {
		this.cookController.endCook();
	}
}

export type BaseRopNodeType = TypedRopNode<NodeParamsConfig>;
export class BaseRopNodeClass extends TypedRopNode<NodeParamsConfig> {}
