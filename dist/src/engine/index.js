import {SceneJsonImporter} from "./io/json/import/Scene";
import {PolyScene as PolyScene2} from "./scene/PolyScene";
import {Poly as Poly2} from "./Poly";
const expressionsRegister = Poly2.instance().expressionsRegister;
const nodesRegister = Poly2.instance().nodesRegister;
import {AllRegister} from "./poly/registers/All";
AllRegister.run();
export {PolyScene2 as PolyScene, SceneJsonImporter, expressionsRegister, nodesRegister};
window.POLY = {
  PolyScene: PolyScene2,
  SceneJsonImporter,
  expressionsRegister,
  nodesRegister
};
