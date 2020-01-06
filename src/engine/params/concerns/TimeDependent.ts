import lodash_includes from 'lodash/includes'
import {BaseParam} from 'src/engine/params/_Base'

export function TimeDependent<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseParam = (<unknown>this) as BaseParam

		is_time_dependent(): boolean {
			return lodash_includes(
				this.self.graph_predecessor_ids(),
				this.self
					.scene()
					.context()
					.graph_node_id()
			)
		}
	}
}
