import lodash_uniq from 'lodash/uniq';
import lodash_clone from 'lodash/clone';
import lodash_sortBy from 'lodash/sortBy';
import {PerformanceNode} from './PerformanceNode';

interface NodesCookData {
	[propName: string]: PerformanceNode;
}
interface NumbersByString {
	[propName: string]: number;
}
interface StringArrayByString {
	[propName: string]: string[];
}

export class CorePerformance {
	private _started: boolean = false;
	_start_time: number | null = 0;
	_previous_timestamp: number = 0;
	_nodes_cook_data: NodesCookData = {};
	_durations_by_name: NumbersByString;
	_durations_count_by_name: NumbersByString;
	_performance_id: number;

	// constructor(){
	// 	console.log("creating perf")
	// 	this._performance_id = Math.random()
	// }

	profile(name: string, method: any) {
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
	// else
	// 	throw "performance already started"
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

	recording_started(): boolean {
		return this._started;
	}

	record_node_cook_data(node: any) {
		const id = node.graph_node_id;
		if (this._nodes_cook_data[id] == null) {
			this._nodes_cook_data[id] = new PerformanceNode(node);
		}
		this._nodes_cook_data[id].update_cook_data();
	}

	record(name: string) {
		if (!this.recording_started()) {
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
		performance_nodes = lodash_sortBy(performance_nodes, (performance_node) => -performance_node.cook_time_total());

		const print_objects = performance_nodes.map((performance_node) => performance_node.print_object());

		console.log('--------------- NODES COOK TIME -----------');

		const table_entries = [];
		const sorted_print_objects = lodash_sortBy(print_objects, (print_object) => -print_object['cook_time_total']);
		for (let print_object of sorted_print_objects) {
			table_entries.push(print_object);
		}

		console.table(table_entries);

		return print_objects;
	}

	print_recordings() {
		// const start_time = this._start_time
		const durations_by_name = lodash_clone(this._durations_by_name);
		const durations_count_by_name = lodash_clone(this._durations_count_by_name);
		//this.reset()

		const durations = [];
		//durations_by_name = {}
		const names_by_duration: StringArrayByString = {};

		for (let name of Object.keys(durations_by_name)) {
			const duration = durations_by_name[name];

			//durations_by_name[name] = duration
			durations.push(duration);
			if (names_by_duration[duration] == null) {
				names_by_duration[duration] = [];
			}
			names_by_duration[duration].push(name);
		}

		durations.sort((a, b) => a - b);
		const sorted_durations = lodash_uniq(durations);

		console.log('--------------- PERF RECORDINGS -----------');
		//console.log("sorted_durations", sorted_durations)
		// let previous_duration = start_time
		const table_entries = [];
		for (let duration of sorted_durations) {
			const names = names_by_duration[duration];
			for (let name of names) {
				const count = durations_count_by_name[name];
				const duration_per_iteration = duration / count;

				const entry = {duration, name, count, duration_per_iteration};
				table_entries.push(entry);
			}

			// previous_duration = duration
		}

		console.table(table_entries);
		return table_entries;
	}
}
