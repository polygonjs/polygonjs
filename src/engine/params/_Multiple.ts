import {TypedParam} from './_Base';
import {FloatParam} from './Float';
import {ParamType} from '../poly/ParamType';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValueSerializedTypeMap} from './types/ParamInitValueSerializedTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import { CoreType } from '../../core/Type';

export abstract class TypedMultipleParam<T extends ParamType> extends TypedParam<T> {
	private _components_contructor = FloatParam;
	protected _components!: FloatParam[];
	get components() {
		return this._components;
	}
	get is_numeric() {
		return true;
	}
	get is_default() {
		for (let c of this.components) {
			if (!c.is_default) {
				return false;
			}
		}
		return true;
	}
	get raw_input() {
		return this._components.map((c) => c.raw_input) as ParamInitValueSerializedTypeMap[T];
	}
	get raw_input_serialized() {
		return this.raw_input;
	}
	protected _copy_value(param: TypedMultipleParam<T>) {
		for (let i = 0; i < this.components.length; i++) {
			const component = this.components[i];
			const src_component = param.components[i];
			component.copy_value(src_component);
		}
	}

	init_components() {
		if (this._components != null) {
			return;
		}
		let index = 0;
		this._components = new Array(this.component_names.length);
		for (let component_name of this.component_names) {
			const component = new this._components_contructor(this.scene); //, `${this.name}${name}`);
			let default_val;
			if (CoreType.isArray(this._default_value)) {
				default_val = this._default_value[index];
			} else {
				default_val = (this._default_value as any)[component_name];
			}
			component.options.copy(this.options);
			component.set_init_value(default_val);

			// component.set_scene(this.scene);
			component.set_name(`${this.name}${component_name}`);
			component.set_parent_param(this);

			// this.add_graph_input(component, false); // already called in set_parent_param
			// component.initialize();
			this._components[index] = component;
			index++;
		}
		// this.compute();
	}

	protected async process_computation(): Promise<void> {
		await this.compute_components();
		this.set_value_from_components();
	}
	set_value_from_components() {}
	// set_raw_input_from_components() {}

	has_expression() {
		for (let c of this.components) {
			if (c.expression_controller?.active) {
				return true;
			}
		}
		return false;
	}

	private async compute_components() {
		const components = this.components;
		// const component_evaluation_states = lodash_map(components, ()=> false);
		// const expected_values_count = components.length;
		// const component_values = [];
		// let component;
		// return lodash_each(this.components(), (component, index)=> {
		const promises = [];
		for (let c of components) {
			if (c.is_dirty) {
				promises.push(c.compute()); //component_value=> {
			}
		}
		await Promise.all(promises);
		// component_values[index] = component_value;
		// component_evaluation_states[index] = true;
		// const evaluated_values_count = lodash_compact(component_evaluation_states).length;
		// check if all components have been evaluated succesfully
		// if (evaluated_values_count === expected_values_count) {
		this.remove_dirty_state();
		// return component_values;
		// }
		// });
		// }
	}
	protected _prefilter_invalid_raw_input(raw_input: any): ParamInitValuesTypeMap[T] {
		if (!CoreType.isArray(raw_input)) {
			const number_or_string = raw_input as number | string;
			const raw_input_wrapped_in_array: StringOrNumber[] = this.component_names.map(() => number_or_string);
			return raw_input_wrapped_in_array as ParamInitValuesTypeMap[T];
		} else {
			return raw_input as ParamInitValuesTypeMap[T];
		}
	}

	protected process_raw_input() {
		const cooker = this.scene.cooker;
		cooker.block();
		const components = this.components;
		for (let c of components) {
			c.emit_controller.block_parent_emit();
		}

		// if (CoreType.isArray(values)) {
		const value = this._raw_input;
		let prev_value: number = 0;
		if (CoreType.isArray(value)) {
			for (let i = 0; i < components.length; i++) {
				let component_value = (value as any)[i];
				// use the prev value, in case we give an array that is too short
				if (component_value == null) {
					component_value = prev_value;
				}
				components[i].set(component_value);
				prev_value = component_value;
			}
		} else {
			for (let i = 0; i < components.length; i++) {
				const component_name = this.component_names[i];
				let component_value = (value as any)[component_name];
				// use the prev value, in case we give a vec2 instead of vec3
				if (component_value == null) {
					component_value = prev_value;
				}
				components[i].set(component_value);
				prev_value = component_value;
			}
		}
		// } else {
		// 	const component_names = this.component_names()
		// 	for (let i = 0; i < components.length; i++) {
		// 		components[i].set(values[component_names[i]])
		// 	}
		// }

		cooker.unblock();

		for (let i = 0; i < components.length; i++) {
			components[i].emit_controller.unblock_parent_emit();
		}
		// this.emit(ParamEvent.UPDATED);

		this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
	}
}

// class BaseMultipleParam extends TypedMultipleParam<Vector> {}
