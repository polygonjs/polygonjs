import {BaseAssemblersRegister} from "./_BaseRegister";
export class AssemblersRegister extends BaseAssemblersRegister {
  assembler(node, name) {
    const pair = this._controller_assembler_by_name.get(name);
    if (pair) {
      const controller = pair.controller;
      const assembler = pair.assembler;
      return new controller(node, assembler);
    }
    return pair;
  }
  unregister_assembler(name) {
    const pair = this._controller_assembler_by_name.get(name);
    super.unregister_assembler(name);
    return pair;
  }
}
