import {BaseNode} from '../_Base';

export function Selectable<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		is_selected() {
			const parent = this.self.parent();
			if (parent) {
				return parent.selection().contains(this.self);
			}
		}
	};
}
