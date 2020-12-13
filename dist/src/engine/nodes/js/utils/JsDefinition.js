import {TypedJsDefinitionCollection} from "./JsDefinitionCollection";
import {JsConnectionPointType} from "../../utils/io/connections/Js";
export var JsDefinitionType;
(function(JsDefinitionType2) {
  JsDefinitionType2["ATTRIBUTE"] = "attribute";
  JsDefinitionType2["FUNCTION"] = "function";
  JsDefinitionType2["UNIFORM"] = "uniform";
})(JsDefinitionType || (JsDefinitionType = {}));
export class TypedJsDefinition {
  constructor(_definition_type, _data_type, _node, _name) {
    this._definition_type = _definition_type;
    this._data_type = _data_type;
    this._node = _node;
    this._name = _name;
  }
  get definition_type() {
    return this._definition_type;
  }
  get data_type() {
    return this._data_type;
  }
  get node() {
    return this._node;
  }
  get name() {
    return this._name;
  }
  collection_instance() {
    return new TypedJsDefinitionCollection();
  }
}
export class AttributeGLDefinition extends TypedJsDefinition {
  constructor(_node, _data_type, _name) {
    super(JsDefinitionType.ATTRIBUTE, _data_type, _node, _name);
    this._node = _node;
    this._data_type = _data_type;
    this._name = _name;
  }
  get line() {
    return `attribute ${this.data_type} ${this.name}`;
  }
}
export class FunctionJsDefinition extends TypedJsDefinition {
  constructor(_node, _name) {
    super(JsDefinitionType.FUNCTION, JsConnectionPointType.FLOAT, _node, _name);
    this._node = _node;
    this._name = _name;
  }
  get line() {
    return this.name;
  }
}
export class UniformJsDefinition extends TypedJsDefinition {
  constructor(_node, _data_type, _name) {
    super(JsDefinitionType.UNIFORM, _data_type, _node, _name);
    this._node = _node;
    this._data_type = _data_type;
    this._name = _name;
  }
  get line() {
    return `uniform ${this.data_type} ${this.name}`;
  }
}
