import {TypedJsDefinition, JsDefinitionType} from './JsDefinition';

export class TypedJsDefinitionCollection<T extends JsDefinitionType> {
	_errored: boolean = false;
	_error_message: string | undefined;

	constructor(private _definitions: TypedJsDefinition<T>[] = []) {}

	get errored() {
		return this._errored;
	}
	get error_message() {
		return this._error_message;
	}

	uniq(): TypedJsDefinition<T>[] {
		const definitions_by_name: Map<string, TypedJsDefinition<T>> = new Map();
		const names: string[] = [];

		for (let definition of this._definitions) {
			if (!this._errored) {
				const name = definition.name();
				const existing = definitions_by_name.get(name);
				if (existing) {
					if (existing.dataType() != definition.dataType()) {
						this._errored = true;
						this._error_message = `attempt to create '${definition.name()}' with types '${definition.dataType()}' by node '${definition
							.node()
							.path()}', when there is already an existing with type ${existing.dataType()} from node '${existing
							.node()
							.path()}'`;
						console.warn('emitting error message:', this._error_message);
					}
				} else {
					definitions_by_name.set(name, definition);
					names.push(name);
				}
			}
		}

		const uniq_definitions: TypedJsDefinition<T>[] = [];
		for (let name of names) {
			const definition = definitions_by_name.get(name);
			if (definition) {
				uniq_definitions.push(definition);
			}
		}
		// sorting may make dependencies be declared after the function calling them
		// const sorted_definitions = ArrayUtils.sortBy(uniq_definitions, (d)=>d.name())
		return uniq_definitions;
	}
}
