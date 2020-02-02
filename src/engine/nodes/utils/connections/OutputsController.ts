import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseNamedConnectionPointType} from './NamedConnectionPoint';
import lodash_isNumber from 'lodash/isNumber';
import lodash_uniq from 'lodash/uniq';
import lodash_isString from 'lodash/isString';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

// interface OutputsOptions {
// 	has_outputs?: boolean;
// }
// TODO: remove the "throw" statements, which seem less necessary now with typescript
export class OutputsController<T extends BaseNodeType> {
	private _has_outputs: boolean = false;
	private _named_output_connection_points: BaseNamedConnectionPointType[] | undefined;
	private _has_named_outputs: boolean = false;

	constructor(private node: T) {}

	// init(options?: OutputsOptions) {
	// 	if (options == null) {
	// 		options = {};
	// 	}
	// 	if (options['has_outputs'] == null) {
	// 		options['has_outputs'] = true;
	// 	}
	// 	this._has_outputs = options['has_outputs'];
	// }

	get has_outputs() {
		return this._has_outputs;
	}
	get has_named_outputs() {
		return this._has_named_outputs;
	}
	has_named_output(name: string): boolean {
		// return this._get_named_output_index_without_error(name) != null;
		return this.get_named_output_index(name) >= 0;
	}
	get named_output_connection_points(): BaseNamedConnectionPointType[] {
		return this._named_output_connection_points || [];
	}
	named_output_connection(index: number): BaseNamedConnectionPointType | undefined {
		if (this._named_output_connection_points) {
			return this._named_output_connection_points[index];
		}
	}
	// protected _get_named_output_index_without_error(name: string): number {
	// 	const connections = this.named_output_connection_points;
	// 	for (let i = 0; i < connections.length; i++) {
	// 		const connection = connections[i];
	// 		if (connection.name == name) {
	// 			return i;
	// 		}
	// 	}
	// 	return -1;
	// }
	get_named_output_index(name: string): number {
		if (this._named_output_connection_points) {
			for (let i = 0; i < this._named_output_connection_points.length; i++) {
				if (this._named_output_connection_points[i].name == name) {
					return i;
				}
			}
		}
		return -1;

		// const index = this._get_named_output_index_without_error(name);
		// if (index == null) {
		// 	const connection_points = this.named_output_connection_points;
		// 	const available_names = connection_points.map((o) => o.name).join(', ');
		// 	throw new Error(`no outputs named '${name}'. available names are ${available_names}`);
		// }
		// return index;
	}
	get_output_index(output_index_or_name: number | string): number {
		if (output_index_or_name) {
			if (lodash_isString(output_index_or_name)) {
				if (this.has_named_outputs) {
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

	named_output_connection_points_by_name(name: string): BaseNamedConnectionPointType | undefined {
		if (this._named_output_connection_points) {
			return this._named_output_connection_points.filter((connection_point) => connection_point.name == name)[0];
		}
	}

	set_named_output_connection_points(connection_points: BaseNamedConnectionPointType[]) {
		this._has_named_outputs = true;
		this._named_output_connection_points = connection_points;
		if (this.node.scene) {
			this.node.set_dirty(this.node);
		}
		this.node.emit(NodeEvent.NAMED_OUTPUTS_UPDATED);
	}
	used_output_names(): string[] {
		if (this.node.io.connections) {
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
				return this.named_output_connection_points[index].name;
			});
			return used_output_names;
		} else {
			return [];
		}
	}
}
