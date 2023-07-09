import {NodeContext} from '../../../engine/poly/NodeContext';
import {TypedNode} from '../../../engine/nodes/_Base';

export class BaseOnCreateHookRegister<NC extends NodeContext, T extends string> {
	context() {
		return NodeContext.SOP as NC;
	}
	type() {
		return 'no-type' as T;
	}
	onCreate(node: TypedNode<NC, any>) {}
}
