import {AttributeGLDefinition} from "../../utils/GLDefinition";
export class AttributeConfig {
  constructor(_gl_type, _name) {
    this._gl_type = _gl_type;
    this._name = _name;
  }
  create_definition(node) {
    return new AttributeGLDefinition(node, this._gl_type, this._name);
  }
}
