// import {CoreMath} from '../../../core/math/_Module';
// import {BaseEventNode} from './_Base';
// // import {BaseParam} from '../../params/_Base';
// import {Vector2} from 'three/src/math/Vector2';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
// import {ParamType} from '../../poly/ParamType';
// // import {SceneContext} from '../../../core/context/Scene';

// export class CounterEventNode extends BaseEventNode {
// 	@ParamF('counter') _param_counter: number;
// 	@ParamF('increment') _param_increment: number;
// 	@ParamB('keep_in_range') _param_keep_in_range: boolean;
// 	@ParamV2('range') _param_range: Vector2;
// 	// private _counter_param: BaseParam;
// 	// _start_value: number
// 	// private _last_counter_value: number = null;
// 	static type() {
// 		return 'counter';
// 	}

// 	initialize_node() {
// 		// this.set_inputs_count_to_zero();

// 		this.add_post_dirty_hook(this._update_counter_if_required.bind(this));
// 	}
// 	_update_counter_if_required(dirty_trigger: CoreGraphNode) {
// 		if (dirty_trigger.graph_node_id == this.scene.time_controller.graph_node.graph_node_id) {
// 			// TODO: this is horrible
// 			if (this._param_counter == null) {
// 				this._param_counter = this.params.float('counter');
// 			}
// 			if (this._param_increment == null) {
// 				this._param_increment = this.params.float('increment');
// 			}
// 			if (this._param_keep_in_range == null) {
// 				this._param_keep_in_range = this.params.boolean('keep_in_range');
// 			}
// 			if (this._param_range == null) {
// 				this._param_range = this.params.vector2('range');
// 			}
// 			this.update_counter();
// 		}
// 	}

// 	create_params() {
// 		const range: [number, number] = [100, 100];
// 		this.add_param(ParamType.FLOAT, 'init', 0);
// 		this.add_param(ParamType.FLOAT, 'counter', 0, {cook: false, range: range});
// 		this.add_param(ParamType.FLOAT, 'increment', 1);
// 		this.add_param(ParamType.BOOLEAN, 'keep_in_range', 0);
// 		this.add_param(ParamType.VECTOR2, 'range', range, {visible_if: {keep_in_range: 1}});
// 	}

// 	async post_create_params() {
// 		// this._start_value = await this.param('init').eval_p()
// 		this.add_graph_input(this.scene.time_controller.graph_node);
// 	}

// 	update_counter() {
// 		const scene = this.scene;
// 		if (scene.frame_range[0] == scene.frame) {
// 			this.params.set_float('counter', this.params.float('init'));
// 		} else {
// 			let new_value = this._param_counter + this._param_increment;
// 			if (this._param_keep_in_range) {
// 				new_value = CoreMath.clamp(new_value, this._param_range.x, this._param_range.y);
// 			}
// 			this.params.set_float('counter', new_value);
// 		}
// 	}
// }
