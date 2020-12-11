import {SceneJsonImporter} from "./io/json/import/Scene";
import {PolyScene as PolyScene2} from "./scene/PolyScene";
import {Poly as Poly2} from "./Poly";
const expressions_register = Poly2.instance().expressions_register;
const nodes_register = Poly2.instance().nodes_register;
import {AllRegister} from "./poly/registers/All";
AllRegister.run();
export {PolyScene2 as PolyScene, SceneJsonImporter, expressions_register, nodes_register};
window.POLY = {
  PolyScene: PolyScene2,
  SceneJsonImporter,
  expressions_register,
  nodes_register
};
