import {BaseSopNode} from '../_Base';

export function GroupParam<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseSopNode = (<unknown>this) as BaseSopNode;
		_add_group_param() {
			this.self.add_param(ParamType.STRING, 'group', '');
		}
	};
}
