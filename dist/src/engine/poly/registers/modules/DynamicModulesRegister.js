import {BaseModulesRegister} from "./_BaseRegister";
export class DynamicModulesRegister extends BaseModulesRegister {
  async module(name) {
    return await super.module(name);
  }
}
