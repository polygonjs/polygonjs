// import lodash_flatten from 'lodash/flatten'
// import lodash_compact from 'lodash/compact'
// import lodash_each from 'lodash/each'
// import lodash_forEach from 'lodash/forEach'
// import lodash_isArray from 'lodash/isArray'
// import lodash_isNumber from 'lodash/isNumber'
// import lodash_isString from 'lodash/isString'
// import lodash_isBoolean from 'lodash/isBoolean'
// import lodash_map from 'lodash/map'
import {TypedParam} from './_Base'
import {FloatParam} from './Float'

import {AsCodeMultiple} from './concerns/visitors/Multiple'
// import {Vector} from 'three/src/math/Vector2'

// interface ParamVector2Values {
// 	x: number
// 	y: number
// }
// interface ParamVector3Values {
// 	x: number
// 	y: number
// 	z: number
// }
// interface ParamVector4Values {
// 	x: number
// 	y: number
// 	z: number
// 	w: number
// }
// interface ParamColorValues {
// 	r: number
// 	g: number
// 	b: number
// }
// import {Color} from 'three/src/math/Color'
// // createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
// interface ComponentsOfComponentsMap {
// 	Color: ParamColorValues
// }
// export interface MultipleParamValueTypeMap {
// 	Color: Color
// }

export class TypedMultipleParam<T> extends AsCodeMultiple(TypedParam)<T> {
	private _components_contructor = FloatParam
	constructor() {
		super()
	}

	static component_names(): string[] {
		return []
	}
	component_names(): string[] {
		const c = (<unknown>this.constructor) as TypedMultipleParam<T>
		return c.component_names()
	}
	init_components() {
		const names = this.component_names()
		for (let i = 0; i < names.length; i++) {
			const component_name = names[i]
			const component = new this._components_contructor()

			component.set_default_value(
				(this._default_value as any)[component_name]
			)
			component.set_options(this._options)

			component.set_scene(this.scene())
			component.set_name(`${this.name()}${name}`)
			component.set_parent_param(this)
			component.initialize()
			return component
		}
	}

	is_multiple() {
		return true
	}
	is_numeric() {
		return true
	}
	// convert_value(v) {
	// 	if (lodash_isBoolean(v)) {
	// 		v = v ? 1 : 0
	// 	}
	// 	if (lodash_isString(v)) {
	// 		v = parseFloat(v)
	// 	}
	// 	if (lodash_isNumber(v)) {
	// 		v = this.component_names().map((c, i) => {
	// 			return v
	// 		})
	// 	}
	// 	if (lodash_isArray(v)) {
	// 		const array = v
	// 		let last_valid_value: T
	// 		v = this.component_names().map((c, i) => {
	// 			let component_val = array[i]
	// 			if (component_val === undefined) {
	// 				component_val = last_valid_value
	// 			}
	// 			last_valid_value = component_val
	// 			return component_val
	// 		})
	// 	}
	// 	return v
	// }
	// value() {
	// 	return this.components().map((component) => component.value())
	// }
	// result() {
	// 	return this.components().map((component) => component.result())
	// }

	has_expression() {
		const components = this.components()
		for (let i = 0; i < components.length; i++) {
			if (components[i].has_expression()) {
				return true
			}
		}
		return false
	}
	// expression() {
	// 	return this.components()
	// 		.map((c) => c.expression())
	// 		.join(';')
	// }
	set_expression(expression: string) {
		// if (lodash_isArray(expressions)) {
		const components = this.components()
		for (let i = 0; i < components.length; i++) {
			components[i].set_expression(expression)
		}
		// } else {
		// 	this.components()[0].set_expression(expressions)
		// }
	}

	is_raw_input_default() {
		const components = this.components()
		for (let i = 0; i < components.length; i++) {
			if (!components[i].is_raw_input_default()) {
				return false
			}
		}
		return true
	}

	async eval_components() {
		const components = this.components()
		// const component_evaluation_states = lodash_map(components, ()=> false);
		// const expected_values_count = components.length;
		// const component_values = [];
		// let component;
		// return lodash_each(this.components(), (component, index)=> {
		const promises = []
		for (let i = 0; i < components.length; i++) {
			promises.push(components[i].eval_p()) //component_value=> {
		}
		const component_values = await Promise.all(promises)
		// component_values[index] = component_value;
		// component_evaluation_states[index] = true;
		// const evaluated_values_count = lodash_compact(component_evaluation_states).length;
		// check if all components have been evaluated succesfully
		// if (evaluated_values_count === expected_values_count) {
		this.remove_dirty_state()
		return component_values
		// }
		// });
		// }
	}

	// eval_key(value) {
	// 	const array = [this.name(), this.expression()]
	// 	if (value) {
	// 		array.push(value.toArray())
	// 	}
	// 	return lodash_flatten(array).join(':')
	// }

	// _eval_component: (component, callback)=>
	// 	component = this.components()[index]
	// 	if component?
	// 		component.eval(callback)
	// 	else
	// 		throw "trying to evaluate component with index #{index} which does not exist"

	set(value: T) {
		const cooker = this.scene().cooker()
		cooker.block()
		const components = this.components()
		for (let i = 0; i < components.length; i++) {
			components[i].block_parent_emit()
		}

		// if (lodash_isArray(values)) {
		for (let i = 0; i < components.length; i++) {
			components[i].set((value as any)[i])
		}
		// } else {
		// 	const component_names = this.component_names()
		// 	for (let i = 0; i < components.length; i++) {
		// 		components[i].set(values[component_names[i]])
		// 	}
		// }

		cooker.unblock()

		for (let i = 0; i < components.length; i++) {
			components[i].unblock_parent_emit()
		}

		this.emit_param_updated()
	}

	is_errored() {
		const components = this.components()
		for (let i = 0; i < components.length; i++) {
			if (components[i].is_errored()) {
				return true
			}
		}
		return false
	}

	error_message() {
		const components = this.components()
		for (let i = 0; i < components.length; i++) {
			if (components[i].is_errored()) {
				return components[i].error_message()
			}
		}
		return null
	}
}

// export class BaseMultipleParam extends TypedMultipleParam<Vector> {}

// set_context: (context)->
// 	lodash_each this.components(), (component)->
// 		component.set_context(context)
// 	this
