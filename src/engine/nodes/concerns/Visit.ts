import {BaseNode} from '../_Base';

interface BaseNodeVisitor {
	node: (node: BaseNode) => void;
}

export function Visit<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;

		visit(visitor: BaseNodeVisitor) {
			return visitor.node(this.self);
		}
	};
}
