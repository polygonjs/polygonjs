import {UniformGLDefinition} from "../../utils/GLDefinition";
export class UniformConfig {
  constructor(_gl_type, _name) {
    this._gl_type = _gl_type;
    this._name = _name;
  }
  create_definition(node) {
    return new UniformGLDefinition(node, this._gl_type, this._name);
  }
}
