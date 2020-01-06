import {BaseParam} from 'src/engine/params/_Base'
import {TypedMultipleParam} from 'src/engine/params/_Multiple'
import {FloatParam} from 'src/engine/params/Float'
import {BaseNode} from 'src/engine/nodes/_Base'
import {CoreWalker} from 'src/core/Walker'

export function Hierarchy<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_parent_param: TypedMultipleParam<any>
		_components: FloatParam[]

		protected self: BaseParam = (<unknown>this) as BaseParam

		set_parent_param(param: TypedMultipleParam<any>) {
			param.add_graph_input(this)
			this._parent_param = param
		}
		parent_param(): BaseParam {
			return this._parent_param
		}
		has_parent_param(): boolean {
			return this._parent_param != null
		}
		full_path(): string {
			return this.self.node().full_path() + '/' + this.self.name()
		}
		path_relative_to(node: BaseNode | BaseParam): string {
			return CoreWalker.relative_path(node, this.self)
		}

		is_multiple(): boolean {
			return false
		}
		components() {
			return this._components
		}
	}
}
