// import {BaseSopNode} from '../_Base';

// export function Named<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseSopNode = (<unknown>this) as BaseSopNode;

// 		post_set_full_path() {
// 			this.set_group_name();
// 		}
// 		set_group_name() {
// 			// ensures the material has a full path set
// 			// allowing the render hook to be set
// 			//this.set_material(@_material)
// 			if (this._master_group) {
// 				this._master_group.name = this.full_path();
// 			}
// 			if (this._master_bypassed_group) {
// 				this._master_bypassed_group.name = this.full_path();
// 			}
// 		}
// 	};
// }
