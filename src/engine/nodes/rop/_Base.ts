import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsController} from '../utils/FlagsController';

export class TypedRopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ROP, K> {
	static nodeContext(): NodeContext {
		return NodeContext.ROP;
	}

	public readonly flags: FlagsController = new FlagsController(this);
	// protected _renderer: R = this._create_renderer();

	initializeBaseNode() {
		this.dirtyController.addPostDirtyHook('cook_immediately', () => {
			this.cookController.cook_main_without_inputs();
		});
	}

	// protected abstract _create_renderer(): R;
	// renderer() {
	// 	return this._renderer;
	// }

	cook() {
		this.cookController.end_cook();
	}
}

export type BaseRopNodeType = TypedRopNode<NodeParamsConfig>;
export class BaseRopNodeClass extends TypedRopNode<NodeParamsConfig> {
	// protected _create_renderer() {
	// 	return {};
	// }
}
