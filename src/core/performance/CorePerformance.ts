import {PerformanceNode} from './PerformanceNode';
import {NodePerformanceData} from '../../engine/nodes/utils/cook/PerformanceController';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {ArrayUtils} from '../ArrayUtils';
import {ObjectUtils} from '../ObjectUtils';

export class CorePerformance {
	private _started: boolean = false;
	_start_time: number | null = 0;
	_previous_timestamp: number = 0;
	_nodes_cook_data: Dictionary<PerformanceNode> = {};
	_durations_by_name: Dictionary<number> = {};
	_durations_count_by_name: Dictionary<number> = {};

	profile(name: string, method: (args?: any) => any) {
		const start_time = performance.now();
		method();
		const total_time = performance.now() - start_time;
		console.log(`${name}: ${total_time}`);
	}

	start() {
		if (!this._started) {
			this.reset();
			this._started = true;
			this._start_time = performance.now();
			this._nodes_cook_data = {};
			this._previous_timestamp = this._start_time;
		}
	}
	stop() {
		this.reset();
	}
	reset() {
		this._started = false;
		this._start_time = null;
		this._durations_by_name = {};
		this._durations_count_by_name = {};
		this._nodes_cook_data = {};
	}

	get started(): boolean {
		return this._started;
	}

	record_node_cook_data(node: BaseNodeType, performance_data: NodePerformanceData) {
		const id = node.graph_node_id;
		if (this._nodes_cook_data[id] == null) {
			this._nodes_cook_data[id] = new PerformanceNode(node);
		}
		this._nodes_cook_data[id].update_cook_data(performance_data);
	}

	record(name: string) {
		if (!this.started) {
			this.start();
		}

		const current_timestamp = performance.now();

		if (this._durations_by_name[name] == null) {
			this._durations_by_name[name] = 0;
		}
		this._durations_by_name[name] += current_timestamp - this._previous_timestamp;
		if (this._durations_count_by_name[name] == null) {
			this._durations_count_by_name[name] = 0;
		}
		this._durations_count_by_name[name] += 1;

		return (this._previous_timestamp = current_timestamp);
	}

	print() {
		this.print_node_cook_data();
		this.print_recordings();
	}

	print_node_cook_data() {
		let performance_nodes = Object.values(this._nodes_cook_data);
		performance_nodes = ArrayUtils.sortBy(
			performance_nodes,
			(performance_node) => performance_node.total_cook_time
		);

		const print_objects = performance_nodes.map((performance_node) => performance_node.print_object());

		console.log('--------------- NODES COOK TIME -----------');

		const table_entries = [];
		const sorted_print_objects = ArrayUtils.sortBy(print_objects, (print_object) => -print_object.total_cook_time);
		for (let print_object of sorted_print_objects) {
			table_entries.push(print_object);
		}

		console.table(table_entries);

		return print_objects;
	}

	print_recordings() {
		const durations_by_name = ObjectUtils.clone(this._durations_by_name);
		const durations_count_by_name = ObjectUtils.clone(this._durations_count_by_name);

		const durations = [];
		const names_by_duration: Dictionary<string[]> = {};

		for (let name of Object.keys(durations_by_name)) {
			const duration = durations_by_name[name];

			durations.push(duration);
			if (names_by_duration[duration] == null) {
				names_by_duration[duration] = [];
			}
			names_by_duration[duration].push(name);
		}

		durations.sort((a, b) => a - b);
		const sorted_durations = ArrayUtils.uniq(durations);

		console.log('--------------- PERF RECORDINGS -----------');
		const table_entries = [];
		for (let duration of sorted_durations) {
			const names = names_by_duration[duration];
			for (let name of names) {
				const count = durations_count_by_name[name];
				const duration_per_iteration = duration / count;

				const entry = {duration, name, count, duration_per_iteration};
				table_entries.push(entry);
			}
		}

		console.table(table_entries);
		return table_entries;
	}
}
