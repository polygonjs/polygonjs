import {TypedObjNode} from "./_Base";
import {Group as Group2} from "three/src/objects/Group";
import {FlagsControllerD} from "../utils/FlagsController";
import {AxesHelper as AxesHelper2} from "three/src/helpers/AxesHelper";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
var BlendMode;
(function(BlendMode2) {
  BlendMode2["TOGETHER"] = "translate + rotate together";
  BlendMode2["SEPARATELY"] = "translate + rotate separately";
})(BlendMode || (BlendMode = {}));
const BLEND_MODES = [BlendMode.TOGETHER, BlendMode.SEPARATELY];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypeAssert} from "../../poly/Assert";
class BlendObjParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.object0 = ParamConfig.OPERATOR_PATH("/geo1", {
      node_selection: {
        context: NodeContext2.OBJ
      }
    });
    this.object1 = ParamConfig.OPERATOR_PATH("/geo2", {
      node_selection: {
        context: NodeContext2.OBJ
      }
    });
    this.mode = ParamConfig.INTEGER(BLEND_MODES.indexOf(BlendMode.TOGETHER), {
      menu: {
        entries: BLEND_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.blend = ParamConfig.FLOAT(0, {
      visible_if: {mode: BLEND_MODES.indexOf(BlendMode.TOGETHER)},
      range: [0, 1],
      range_locked: [false, false]
    });
    this.blend_t = ParamConfig.FLOAT(0, {
      visible_if: {mode: BLEND_MODES.indexOf(BlendMode.SEPARATELY)},
      range: [0, 1],
      range_locked: [false, false]
    });
    this.blend_r = ParamConfig.FLOAT(0, {
      visible_if: {mode: BLEND_MODES.indexOf(BlendMode.SEPARATELY)},
      range: [0, 1],
      range_locked: [false, false]
    });
  }
}
const ParamsConfig2 = new BlendObjParamConfig();
export class BlendObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.hierarchy_controller = new HierarchyController2(this);
    this.flags = new FlagsControllerD(this);
    this._helper = new AxesHelper2(1);
    this._t0 = new Vector32();
    this._q0 = new Quaternion2();
    this._s0 = new Vector32();
    this._t1 = new Vector32();
    this._q1 = new Quaternion2();
    this._s1 = new Vector32();
  }
  static type() {
    return "blend";
  }
  create_object() {
    const group = new Group2();
    group.matrixAutoUpdate = false;
    return group;
  }
  initialize_node() {
    this.hierarchy_controller.initialize_node();
    this.io.inputs.set_count(0);
    this.add_post_dirty_hook("blend_on_dirty", () => {
      this.cook_controller.cook_main_without_inputs();
    });
    this.object.add(this._helper);
    this.flags.display.add_hook(() => {
      this._helper.visible = this.flags.display.active;
    });
  }
  cook() {
    const obj_node0 = this.p.object0.found_node_with_context(NodeContext2.OBJ);
    const obj_node1 = this.p.object1.found_node_with_context(NodeContext2.OBJ);
    if (obj_node0 && obj_node1) {
      this._blend(obj_node0.object, obj_node1.object);
    }
    this.cook_controller.end_cook();
  }
  _blend(object0, object1) {
    const mode = BLEND_MODES[this.pv.mode];
    switch (mode) {
      case BlendMode.TOGETHER:
        return this._blend_together(object0, object1);
      case BlendMode.SEPARATELY:
        return this._blend_separately(object0, object1);
    }
    TypeAssert.unreachable(mode);
  }
  _blend_together(object0, object1) {
    this._decompose_matrices(object0, object1);
    this._object.position.copy(this._t0).lerp(this._t1, this.pv.blend);
    this._object.quaternion.copy(this._q0).slerp(this._q1, this.pv.blend);
    if (!this._object.matrixAutoUpdate) {
      this._object.updateMatrix();
    }
  }
  _blend_separately(object0, object1) {
    this._decompose_matrices(object0, object1);
    this._object.position.copy(this._t0).lerp(this._t1, this.pv.blend_t);
    this._object.quaternion.copy(this._q0).slerp(this._q1, this.pv.blend_r);
    if (!this._object.matrixAutoUpdate) {
      this._object.updateMatrix();
    }
  }
  _decompose_matrices(object0, object1) {
    object0.matrixWorld.decompose(this._t0, this._q0, this._s0);
    object1.matrixWorld.decompose(this._t1, this._q1, this._s1);
  }
}
