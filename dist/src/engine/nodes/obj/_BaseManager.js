import {TypedObjNode} from "./_Base";
import {Group as Group2} from "three/src/objects/Group";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
export class BaseManagerObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this._attachable_to_hierarchy = false;
  }
  create_object() {
    const group = new Group2();
    group.matrixAutoUpdate = false;
    return group;
  }
  cook() {
    this.cook_controller.end_cook();
  }
}
class ParamLessObjParamsConfig extends NodeParamsConfig {
}
export class ParamLessBaseManagerObjNode extends BaseManagerObjNode {
}
