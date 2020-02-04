import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from 'src/engine/nodes/utils/params/ParamsController';

export abstract class Single<T extends ParamType> extends TypedParam<T> {
	// protected _expression: string
	// convert_value(value: any) {
	// 	return value
	// }

	// is_raw_input_default() {
	// 	return this._raw_input == this._default_value;
	// }
	//
	//
	// EVAL
	//
	//

	// async eval_raw() {
	// 	// be careful when saving a result here,
	// 	// as it fucks it up when evaluating for points (or any list of entities)
	// 	if (this.is_dirty) {
	// 		// || this._value == null) { // TODO: typescript: removed check if value is null, as it should not happen
	// 		//this.clear_error()
	// 		if (this.has_expression()) {
	// 			const val = await this.expression_controller.eval();
	// 			const converted = this.convert(val);
	// 			this.post_eval_raw(converted);
	// 			return converted;
	// 		} else {
	// 			this._value = this.convert(this._raw_input);
	// 			this.remove_dirty_state();
	// 			return this._value;
	// 		}
	// 	} else {
	// 		return this._value;
	// 	}
	// }

	// eval_with_promise: ->
	// 	new Promise (resolve, reject)=>
	// 		this.eval_raw (value)=>
	// 			resolve(value)

	// eval_sync: ->
	// 	test = (a)->
	// 		await a.eval_with_promise()
	// 	test(this)

	post_eval_raw(value: ParamValuesTypeMap[T]) {
		const previous_value = this._value; // TODO: I should probably clone this, to compare if the result has changed, and then execute the callback
		this._value = value;

		if (this._value != null) {
			// TODO: typescript: value should never be null, so there should be a different way of setting/clearing error state
			this.states.error.clear();
		}

		const was_dirty = this.is_dirty;
		this.remove_dirty_state();
		// TODO: this gets emitted for every point when in a Point SOP
		// trying now to only emit if the param was dirty
		if (was_dirty) {
			this.emit_controller.emit_param_updated();
		}

		// TODO: the callback should only be executed when the result has changed?
		// but how to make that reliable for vectors
		if (this.options.has_callback() && previous_value !== this._value) {
			return this.options.execute_callback();
		}
	}

	// result() {
	// 	return this._result
	// }

	// TODO
	// the goal if this should be"
	// - faster params eval over points
	// - faster error propagation (only sent once to the node, not N times
	// eval_for_entities(entities, callback){}
	// this should be easier once I integrate promises

	// eval_later: (callback)->
	// 	c = =>
	// 		this.eval(callback)
	// 	setTimeout(c, 50)

	// set(new_value: ParamInitValuesTypeMap[T]) {
	// 	// new_value = this.convert_value(new_value)
	// 	// TODO: typescript
	// 	// if (this._value === new_value && !this.has_expression()) {
	// 	// 	return;
	// 	// }

	// 	const cooker = this.scene.cooker;
	// 	cooker.block();
	// 	this.states.error.clear();
	// 	this._value = this.convert(new_value);
	// 	this.set_expression(null);
	// 	this.set_dirty();
	// 	this.remove_dirty_state();
	// 	this.options.execute_callback();
	// 	cooker.unblock();

	// 	this.emit_controller.emit_param_updated();
	// }
	// set_expression(string: string){
	// 	if ((string === null) && !this.has_expression()) { return; }
	// 	if ((string === this._expression) && this.has_expression()) { return; }

	// 	const cooker = this.scene().cooker();
	// 	cooker.block();
	// 	this.graph_disconnect_predecessors(); // necessary for time dependency
	// 	this.clear_error();
	// 	this.reset_parsed_expression();
	// 	this._expression = string;
	// 	//this.parse_expression_and_update_dependencies()
	// 	this.set_dirty();
	// 	cooker.unblock();
	// 	this.emit_param_updated();

	// }
}
