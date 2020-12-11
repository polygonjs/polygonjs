import {TypedLightObjNode} from "./_BaseLight";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {TransformController as TransformController2, TransformedParamConfig} from "./utils/TransformController";
import {FlagsControllerD} from "../utils/FlagsController";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
class TransformedObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
}
export class BaseLightTransformedObjNode extends TypedLightObjNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerD(this);
    this.hierarchy_controller = new HierarchyController2(this);
    this.transform_controller = new TransformController2(this);
  }
  initialize_base_node() {
    super.initialize_base_node();
    this.hierarchy_controller.initialize_node();
    this.transform_controller.initialize_node();
  }
  cook() {
    this.transform_controller.update();
    this.update_light_params();
    this.update_shadow_params();
    this.cook_controller.end_cook();
  }
}
