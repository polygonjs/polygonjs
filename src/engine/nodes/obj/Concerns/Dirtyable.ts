import {BaseObjectNode} from '../_Base';
export function Dirtyable<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseObjectNode = (<unknown>this) as BaseObjectNode;

		async eval_required_inputs_p(): Promise<any[]> {
			return [];
		}

		_init_dirtyable_hook() {
			this.self.add_post_dirty_hook(this._cook_main_without_inputs_later.bind(this));
		}
		_cook_main_without_inputs_later() {
			const c = () => {
				this.self.cook_main_without_inputs();
			};
			setTimeout(c, 0);
			// this.eval_all_params().then( ()=>{ this.cook() } )
		}
	};
}
