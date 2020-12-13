import {TypedGLDefinitionCollection} from "./GLDefinitionCollection";
import {GlConnectionPointType} from "../../utils/io/connections/Gl";
export var GLDefinitionType;
(function(GLDefinitionType2) {
  GLDefinitionType2["ATTRIBUTE"] = "attribute";
  GLDefinitionType2["FUNCTION"] = "function";
  GLDefinitionType2["UNIFORM"] = "uniform";
  GLDefinitionType2["VARYING"] = "varying";
})(GLDefinitionType || (GLDefinitionType = {}));
export class TypedGLDefinition {
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
    return new TypedGLDefinitionCollection();
  }
}
export class AttributeGLDefinition extends TypedGLDefinition {
  constructor(_node, _data_type, _name) {
    super(GLDefinitionType.ATTRIBUTE, _data_type, _node, _name);
    this._node = _node;
    this._data_type = _data_type;
    this._name = _name;
  }
  get line() {
    return `attribute ${this.data_type} ${this.name}`;
  }
}
export class FunctionGLDefinition extends TypedGLDefinition {
  constructor(_node, _name) {
    super(GLDefinitionType.FUNCTION, GlConnectionPointType.FLOAT, _node, _name);
    this._node = _node;
    this._name = _name;
  }
  get line() {
    return this.name;
  }
}
export class UniformGLDefinition extends TypedGLDefinition {
  constructor(_node, _data_type, _name) {
    super(GLDefinitionType.UNIFORM, _data_type, _node, _name);
    this._node = _node;
    this._data_type = _data_type;
    this._name = _name;
  }
  get line() {
    return `uniform ${this.data_type} ${this.name}`;
  }
}
export class VaryingGLDefinition extends TypedGLDefinition {
  constructor(_node, _data_type, _name) {
    super(GLDefinitionType.VARYING, _data_type, _node, _name);
    this._node = _node;
    this._data_type = _data_type;
    this._name = _name;
  }
  get line() {
    return `varying ${this.data_type} ${this.name}`;
  }
}
