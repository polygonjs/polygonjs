import {BaseNode} from '../_Base';
import {NamedConnection} from '../utils/NamedConnection';
import lodash_isNumber from 'lodash/isNumber';
import lodash_uniq from 'lodash/uniq';
import lodash_isString from 'lodash/isString';

interface OutputsOptions {
	has_outputs?: boolean;
}

export function OutputsOwner<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		private _has_outputs: boolean = false;
		private _named_outputs: NamedConnection[] = [];
		private _has_named_outputs: boolean = false;

		_init_outputs(options?: OutputsOptions) {
			if (options == null) {
				options = {};
			}
			if (options['has_outputs'] == null) {
				options['has_outputs'] = true;
			}
			this._has_outputs = options['has_outputs'];
		}

		has_outputs() {
			return this._has_outputs;
		}
		has_named_outputs() {
			return this._has_named_outputs;
		}
		has_named_output(name: string) {
			return this._get_named_output_index_without_error(name) != null;
		}
		named_outputs(): NamedConnection[] {
			return this._named_outputs;
		}
		named_output(index: number): NamedConnection {
			return this._named_outputs[index];
		}
		protected _get_named_output_index_without_error(name: string): number {
			const named_outputs = this.named_outputs();
			let index = null;
			named_outputs.forEach((output, i) => {
				if (output.name() == name) {
					index = i;
				}
			});
			return index;
		}
		get_named_output_index(name: string): number {
			const index = this._get_named_output_index_without_error(name);
			if (index == null) {
				const named_outputs = this.named_outputs();
				const available_names = named_outputs.map((o) => o.name()).join(', ');
				throw new Error(`no outputs named '${name}'. available names are ${available_names}`);
			}
			return index;
		}
		get_output_index(output_index_or_name: number | string): number {
			if (output_index_or_name) {
				if (lodash_isString(output_index_or_name)) {
					if (this.has_named_outputs()) {
						return this.get_named_output_index(output_index_or_name);
					} else {
						throw new Error(`node ${this.self.full_path()} has no named outputs`);
					}
				} else {
					return output_index_or_name as number;
				}
			}
		}

		named_output_by_name(name: string): NamedConnection {
			return this._named_outputs.filter((named_output) => named_output.name() == name)[0];
		}

		set_named_outputs(named_outputs: NamedConnection[]) {
			this._has_named_outputs = true;
			this._named_outputs = named_outputs;
			if (this.self.scene()) {
				this.self.set_dirty(this);
			}
			this.self.emit('node_named_outputs_updated');
		}
		used_output_names(): string[] {
			const output_indices = lodash_uniq(
				this.self.output_connections().map((connection) => (connection ? connection.output_index() : null))
			);
			const used_output_indices = [];
			output_indices.forEach((index) => {
				if (lodash_isNumber(index)) {
					used_output_indices.push(index);
				}
			});
			const used_output_names: string[] = used_output_indices.map((index) => {
				return this.named_outputs()[index].name();
			});
			return used_output_names;
		}
	};
}
