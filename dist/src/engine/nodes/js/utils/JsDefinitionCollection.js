export class TypedJsDefinitionCollection {
  constructor(_definitions = []) {
    this._definitions = _definitions;
    this._errored = false;
  }
  get errored() {
    return this._errored;
  }
  get error_message() {
    return this._error_message;
  }
  uniq() {
    const definitions_by_name = new Map();
    const names = [];
    for (let definition of this._definitions) {
      if (!this._errored) {
        const name = definition.name;
        const existing = definitions_by_name.get(name);
        if (existing) {
          if (existing.data_type != definition.data_type) {
            this._errored = true;
            this._error_message = `attempt to create '${definition.name}' with types '${definition.data_type}' by node '${definition.node.full_path()}', when there is already an existing with type ${existing.data_type} from node '${existing.node.full_path()}'`;
            console.warn("emitting error message:", this._error_message);
          }
        } else {
          definitions_by_name.set(name, definition);
          names.push(name);
        }
      }
    }
    const uniq_definitions = [];
    for (let name of names) {
      const definition = definitions_by_name.get(name);
      if (definition) {
        uniq_definitions.push(definition);
      }
    }
    return uniq_definitions;
  }
}
