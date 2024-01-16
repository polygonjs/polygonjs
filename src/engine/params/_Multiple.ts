import {StringOrNumber} from '../../types/GlobalTypes';
import {TypedParam} from './_Base';
import {FloatParam} from './Float';
import {ParamType} from '../poly/ParamType';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValueSerializedTypeMap} from './types/ParamInitValueSerializedTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {isArray} from '../../core/Type';
import {CoreParamSerializer} from './utils/CoreParamSerializer';

export abstract class TypedMultipleParam<T extends ParamType> extends TypedParam<T> {
	private _components_contructor = FloatParam;
	protected override _components!: FloatParam[];
	private _componentsCount = 0;
	override get components() {
		return this._components;
	}
	override isNumeric() {
		return true;
	}
	override isDefault() {
		for (const c of this.components) {
			if (!c.isDefault()) {
				return false;
			}
		}
		return true;
	}
	override rawInput() {
		return this._components.map((c) => c.rawInput()) as ParamInitValueSerializedTypeMap[T];
	}
	rawInputSerialized() {
		return this._components.map((c) => c.rawInputSerialized()) as ParamInitValueSerializedTypeMap[T];
	}
	protected override _copyValue(param: TypedMultipleParam<T>) {
		for (let i = 0; i < this.components.length; i++) {
			const component = this.components[i];
			const src_component = param.components[i];
			component.copyValue(src_component);
		}
	}

	override initComponents() {
		if (this._components != null) {
			return;
		}
		let index = 0;
		this._components = new Array(this.componentNames().length);
		for (const componentName of this.componentNames()) {
			const component = new this._components_contructor(this.scene(), this.node, {
				serializerClass: this._serializer?.constructor as typeof CoreParamSerializer<any> | undefined,
			}); //, `${this.name}${name}`);
			let default_val;
			if (isArray(this._default_value)) {
				default_val = this._default_value[index];
			} else {
				default_val = (this._default_value as any)[componentName];
			}
			component.options.copy(this.options);
			component.setInitValue(default_val);

			// component.setScene(this.scene);
			component.setName(`${this.name()}${componentName}`);
			component.set_parent_param(this);

			// this.addGraphInput(component, false); // already called in set_parent_param
			// component.initialize();
			this._components[index] = component;
			index++;
		}
		this._componentsCount = this._components.length;
		// this.compute();
	}

	protected override async processComputation(): Promise<void> {
		await this.computeComponents();
		this.setValueFromComponents();
	}

	abstract setValueFromComponents(): void;
	// set_raw_input_from_components() {}

	override hasExpression() {
		for (const c of this.components) {
			if (c.expressionController?.active()) {
				return true;
			}
		}
		return false;
	}

	// private _promises:Promise<void>[] = [];
	private async computeComponents() {
		const components = this.components;
		// _promises.length = 0;
		// in order to avoid having to allocate an array
		// which could allow us to use Promise.all()
		// we use a for loop instead,
		// even if it means that the rare case where more than 1 component has an expression
		// this would be slower
		for (const c of components) {
			if (c.isDirty()) {
				await c.compute();
				// _promises.push(c.compute());
			}
		}
		// await Promise.all(_promises);
		this.removeDirtyState();
	}
	protected override _prefilterInvalidRawInput(raw_input: any): ParamInitValuesTypeMap[T] {
		if (!isArray(raw_input)) {
			const numberOrString = raw_input as number | string;
			const raw_input_wrapped_in_array: StringOrNumber[] = this.componentNames().map(() => numberOrString);
			return raw_input_wrapped_in_array as ParamInitValuesTypeMap[T];
		} else {
			return raw_input as ParamInitValuesTypeMap[T];
		}
	}

	protected override processRawInput() {
		const cooker = this.scene().cooker;
		cooker.block();
		const components = this.components;
		for (const c of components) {
			c.emitController.blockParentEmit();
		}

		// if (isArray(values)) {
		const value = this._raw_input;
		let prevValue: number = 0;
		if (isArray(value)) {
			for (let i = 0; i < this._componentsCount; i++) {
				let componentValue = (value as any)[i];
				// use the prev value, in case we give an array that is too short
				if (componentValue == null) {
					componentValue = prevValue;
				}
				components[i].set(componentValue);
				prevValue = componentValue;
			}
		} else {
			for (let i = 0; i < this._componentsCount; i++) {
				const componentName = this.componentNames()[i];
				let componentValue = (value as any)[componentName];
				// use the prev value, in case we give a vec2 instead of vec3
				if (componentValue == null) {
					componentValue = prevValue;
				}
				components[i].set(componentValue);
				prevValue = componentValue;
			}
		}
		// } else {
		// 	const component_names = this.componentNames()()
		// 	for (let i = 0; i < components.length; i++) {
		// 		components[i].set(values[component_names[i]])
		// 	}
		// }

		cooker.unblock();

		for (const component of this.components) {
			component.emitController.unblockParentEmit();
		}
		// this.emit(ParamEvent.UPDATED);

		this.emitController.emit(ParamEvent.VALUE_UPDATED);
	}
}

// class BaseMultipleParam extends TypedMultipleParam<Vector> {}
