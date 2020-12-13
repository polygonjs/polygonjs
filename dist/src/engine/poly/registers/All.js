import {AllNodesRegister} from "./nodes/All";
import {AllExpressionsRegister} from "./expressions/All";
import {AllModulesRegister} from "./modules/All";
import {AllAssemblersRegister} from "./assemblers/All";
import {Poly as Poly2} from "../../Poly";
export class AllRegister {
  static async run() {
    if (this._started) {
      return;
    }
    this._started = true;
    AllNodesRegister.run(Poly2.instance());
    AllExpressionsRegister.run(Poly2.instance());
    AllModulesRegister.run(Poly2.instance());
    AllAssemblersRegister.run(Poly2.instance());
  }
}
AllRegister._started = false;
