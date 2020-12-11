import {TypedObjNode} from "./_Base";
import {Group as Group2} from "three/src/objects/Group";
import {TransformedParamConfig, TransformController as TransformController2} from "./utils/TransformController";
import {FlagsControllerD} from "../utils/FlagsController";
import {AxesHelper as AxesHelper2} from "three/src/helpers/AxesHelper";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
class NullObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
}
const ParamsConfig2 = new NullObjParamConfig();
export class NullObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.hierarchy_controller = new HierarchyController2(this);
    this.transform_controller = new TransformController2(this);
    this.flags = new FlagsControllerD(this);
    this._helper = new AxesHelper2(1);
  }
  static type() {
    return "null";
  }
  create_object() {
    const group = new Group2();
    group.matrixAutoUpdate = false;
    return group;
  }
  initialize_node() {
    this.hierarchy_controller.initialize_node();
    this.transform_controller.initialize_node();
    this.object.add(this._helper);
    this._helper.matrixAutoUpdate = false;
    this.flags.display.add_hook(() => {
      this._helper.visible = this.flags.display.active;
    });
  }
  cook() {
    this.transform_controller.update();
    this.cook_controller.end_cook();
  }
}
