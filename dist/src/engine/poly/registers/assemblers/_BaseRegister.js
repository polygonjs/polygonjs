export var AssemblerName;
(function(AssemblerName2) {
  AssemblerName2["GL_MESH_BASIC"] = "GL_MESH_BASIC";
  AssemblerName2["GL_MESH_LAMBERT"] = "GL_MESH_LAMBERT";
  AssemblerName2["GL_MESH_STANDARD"] = "GL_MESH_STANDARD";
  AssemblerName2["GL_PARTICLES"] = "GL_PARTICLES";
  AssemblerName2["GL_POINTS"] = "GL_POINTS";
  AssemblerName2["GL_TEXTURE"] = "GL_TEXTURE";
  AssemblerName2["GL_VOLUME"] = "GL_VOLUME";
})(AssemblerName || (AssemblerName = {}));
export class BaseAssemblersRegister {
  constructor() {
    this._controller_assembler_by_name = new Map();
  }
  register(name, controller, assembler) {
    this._controller_assembler_by_name.set(name, {
      controller,
      assembler
    });
  }
  unregister(name) {
    this._controller_assembler_by_name.delete(name);
  }
}
