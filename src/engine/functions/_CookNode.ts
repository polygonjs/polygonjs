import {NamedFunction2} from './_Base';
import {BaseSopNodeType} from '../nodes/sop/_Base';
import {NodeContext} from '../poly/NodeContext';
export interface CookNodeFunctionOptions {
	onCookCompleted: () => void;
}
export interface CookNodeFunctionOptionsSerialized {
	onCookCompleted: string;
}

export class cookNode extends NamedFunction2<[BaseSopNodeType, CookNodeFunctionOptions]> {
	static override type() {
		return 'cookNode';
	}
	func(node: BaseSopNodeType, options: CookNodeFunctionOptions): void {
		if (node && node.context() == NodeContext.SOP) {
			node.setDirty();
			node.compute().then(() => {
				options.onCookCompleted();
			});
		}
	}
}
