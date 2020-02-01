import {BaseNodeType} from 'src/engine/nodes/_Base';
import {NamedConnection} from '../NamedConnection';
import lodash_isNumber from 'lodash/isNumber';
import lodash_uniq from 'lodash/uniq';
import lodash_isString from 'lodash/isString';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

interface OutputsOptions {
	has_outputs?: boolean;
}

export class OutputsController<T extends BaseNodeType> {
	private _has_outputs: boolean = false;
	private _named_outputs: NamedConnection[] = [];
	private _has_named_outputs: boolean = false;

	constructor(private node: T) {}

	init(options?: OutputsOptions) {
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
		let index = -1;
		named_outputs.forEach((output, i) => {
			if (output.name == name) {
				index = i;
			}
		});
		return index;
	}
	get_named_output_index(name: string): number {
		const index = this._get_named_output_index_without_error(name);
		if (index == null) {
			const named_outputs = this.named_outputs();
			const available_names = named_outputs.map((o) => o.name).join(', ');
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
					console.warn(`node ${this.node.full_path()} has no named outputs`);
					return -1;
				}
			} else {
				return output_index_or_name;
			}
		}
		return -1;
	}

	named_output_by_name(name: string): NamedConnection {
		return this._named_outputs.filter((named_output) => named_output.name == name)[0];
	}

	set_named_outputs(named_outputs: NamedConnection[]) {
		this._has_named_outputs = true;
		this._named_outputs = named_outputs;
		if (this.node.scene) {
			this.node.set_dirty(this.node);
		}
		this.node.emit(NodeEvent.NAMED_OUTPUTS_UPDATED);
	}
	used_output_names(): string[] {
		const output_indices = lodash_uniq(
			this.node.io.connections
				.output_connections()
				.map((connection) => (connection ? connection.output_index : null))
		);
		const used_output_indices: number[] = [];
		output_indices.forEach((index) => {
			if (lodash_isNumber(index)) {
				used_output_indices.push(index);
			}
		});
		const used_output_names: string[] = used_output_indices.map((index) => {
			return this.named_outputs()[index].name;
		});
		return used_output_names;
	}
}
