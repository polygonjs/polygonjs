import {BaseNode} from '../_Base';

export function Cook<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		_cooking: boolean = false;
		_cooks_count: number = 0;
		_max_cook_time: number = -1;
		_cooking_dirty_timestamp: number;
		_cook_time_with_inputs: number;
		_cook_time_with_inputs_start: number;
		_cook_time_start: number;
		_cook_time: number;
		_cook_time_params_start: number;
		_cook_time_params: number;
		_last_eval_key: string;

		_init_cook() {
			// this._cooking = false;
			// this._cooks_count = 0;
			// this._max_cook_time = -1;
		}

		// post_set_dirty: (original_trigger_graph_node, direct_trigger_graph_node)->
		//this.emit 'node_dirty_updated'
		// this.node_post_set_dirty()
		// post_remove_dirty_state: (message)->
		// 	if !message?
		// 		throw "remove dirty state without message"

		// node_post_set_dirty: ->
		// 	#
		private _init_cooking_state() {
			this._cooking = true;
		}
		private _init_cooking_start_time(perf_active?: boolean) {
			if (perf_active == null) {
				perf_active = this.self._performance.recording_started();
			}
			if (perf_active) {
				this._cook_time_start = performance.now();
			}
		}

		private async _start_cook_if_no_errors(input_contents?: any[]) {
			if (this.self.is_errored()) {
				this.self.end_cook();
			} else {
				// this.self.cook(input_containers);
				try {
					await this.self.cook(input_contents);
				} catch (e) {
					this.self.set_error(`node internal error: '${e}'.`);
					console.error(this.self.full_path(), e);
					this.self.end_cook();
				}
			}
		}

		async cook_main() {
			if (this.is_cooking()) {
				return;
			}
			this._init_cooking_state();
			this._cooking_dirty_timestamp = this.self.dirty_timestamp();
			const perf_active = this.self._performance.recording_started();
			if (perf_active) {
				this._cook_time_with_inputs_start = performance.now();
			}
			this.self.clear_error();

			//this._block_params_dirty_propagation()
			const input_containers = await this.evaluate_inputs_and_params();

			//console.log("#{this.full_path()} cook start")
			this._init_cooking_start_time(perf_active);

			const input_contents = [];
			if (input_containers) {
				let input_container;
				for (let i = 0; i < input_containers.length; i++) {
					input_container = input_containers[i];
					if (this.self.input_clonable_state_with_override(i)) {
						input_contents.push(input_container.core_content_cloned());
					} else {
						input_contents.push(input_container.core_content());
					}
				}
			}

			await this._start_cook_if_no_errors(input_contents);
		}
		async cook_main_without_inputs() {
			if (this.is_cooking()) {
				return;
			}
			this._init_cooking_state();
			const perf_active = this.self._performance.recording_started();
			this._init_cooking_start_time(perf_active);
			this.self.clear_error();

			await this.self.eval_all_params();
			await this._start_cook_if_no_errors();
		}
		// catch e
		// 	console.error(this.full_path())
		// 	console.error(e)
		// 	this.set_error("failed to cook: #{e}")

		end_cook(message?: string) {
			this._increase_cooks_count();

			const dirty_timestamp = this.dirty_timestamp();
			if (dirty_timestamp == null || dirty_timestamp === this._cooking_dirty_timestamp) {
				this.self.remove_dirty_state();
				this._terminate_cook_process(message);
			} else {
				this._cooking = false;
				this.cook_main();
			}
		}

		_terminate_cook_process(message?: string) {
			if (this.is_cooking()) {
				//this._unblock_params_dirty_propagation()
				this._cooking = false;

				// this._cook_eval_key = `${this.graph_node_id()}/${performance.now()}@${this.context().frame()}`;

				this._record_cook_time();
				//console.log("END COOK: #{this.full_path()} #{this.cook_time()} (with inputs:#{this.cook_time_with_inputs()}) (cook count: #{@_cooks_count}): #{message}")
				//this.notify_requesters()
				return setTimeout(this.notify_requesters.bind(this), 0);
			}
		}
		private _increase_cooks_count() {
			if (this.is_cooking()) {
				if (this._cook_time_start != null) {
					this._cooks_count += 1;
				}
			}
		}

		// cook_eval_key() {
		// 	if (!this.is_dirty()) {
		// 		return this._cook_eval_key;
		// 	} else {
		// 		return performance.now();
		// 	}
		// }

		_record_cook_time() {
			if (this.self._performance.recording_started()) {
				const cook_time_end = performance.now();

				if (this._cook_time_with_inputs_start != null) {
					this._cook_time_with_inputs = cook_time_end - this._cook_time_with_inputs_start;
					this._cook_time_with_inputs_start = null;
				}

				if (this._cook_time_params_start != null) {
					this._cook_time_params = this._cook_time_start - this._cook_time_params_start;
				}

				if (this._cook_time_start != null) {
					this._cook_time = cook_time_end - this._cook_time_start;
					this._cook_time_start = null;
				}

				this._max_cook_time = Math.max(this._max_cook_time, this._cook_time);
			}

			if (this.self._performance.recording_started()) {
				return this.self._performance.record_node_cook_data(this);
			}
		}

		// allow_eval_key_check() {
		// 	return false;
		// }

		async evaluate_inputs_and_params() {
			//t0 = performance.now()

			const input_containers = await this.self.eval_required_inputs_p();
			// const inputs_eval_key = input_containers.map( c => c.eval_key()).join('-');

			if (this.self.self._performance.recording_started()) {
				this._cook_time_params_start = performance.now();
			}

			/*const params_eval_key = */ await this.self.eval_all_params();
			// const full_eval_key = [inputs_eval_key, params_eval_key].join('+');
			// if (this.allow_eval_key_check() && (this._last_eval_key != null) && (this._last_eval_key === full_eval_key)) {
			// 	this._terminate_cook_process('no need to cook');
			// } else {
			// 	this._last_eval_key = full_eval_key;
			// }
			return input_containers;
		}

		is_cooking(): boolean {
			return this._cooking === true;
		}
		cooks_count(): number {
			return this._cooks_count;
		}
		cook_time(): number {
			return this._cook_time;
		}
		//this._time_with_precision(@_cook_time)
		cook_time_with_inputs() {
			return this._cook_time_with_inputs;
		}
		//this._time_with_precision(@_cook_time_with_inputs)
		cook_time_params() {
			return this._cook_time_params;
		}
		_time_with_precision(time: number) {
			const precision = 1000;
			return Math.round(time * precision) / precision;
		}
	};
}

// cook_time_start: ->
// 	@_cook_time_start
// cook_time_end: ->
// 	@_cook_time_end

// max_cook_time: ->
// 	@_max_cook_time
