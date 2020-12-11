import {TypedObjNode} from "./_Base";
import {FlagsControllerD} from "../utils/FlagsController";
import {AxesHelper as AxesHelper2} from "three/src/helpers/AxesHelper";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GeoObjNode} from "./Geo";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {TypeAssert} from "../../poly/Assert";
var RivetUpdateMode;
(function(RivetUpdateMode2) {
  RivetUpdateMode2["ON_RENDER"] = "On Every Render";
  RivetUpdateMode2["MANUAL"] = "Manual";
})(RivetUpdateMode || (RivetUpdateMode = {}));
const UPDATE_MODES = [RivetUpdateMode.ON_RENDER, RivetUpdateMode.MANUAL];
class RivetObjParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.object = ParamConfig.OPERATOR_PATH("", {
      node_selection: {
        context: NodeContext2.OBJ
      },
      dependent_on_found_node: false,
      compute_on_dirty: true,
      callback: (node) => {
        RivetObjNode.PARAM_CALLBACK_update_resolved_object(node);
      }
    });
    this.point_index = ParamConfig.INTEGER(0, {
      range: [0, 100]
    });
    this.update_mode = ParamConfig.INTEGER(UPDATE_MODES.indexOf(RivetUpdateMode.ON_RENDER), {
      callback: (node) => {
        RivetObjNode.PARAM_CALLBACK_update_update_mode(node);
      },
      menu: {
        entries: UPDATE_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.update = ParamConfig.BUTTON(null, {
      callback: (node) => {
        RivetObjNode.PARAM_CALLBACK_update(node);
      },
      visible_if: {update_mode: UPDATE_MODES.indexOf(RivetUpdateMode.MANUAL)}
    });
  }
}
const ParamsConfig2 = new RivetObjParamConfig();
export class RivetObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.hierarchy_controller = new HierarchyController2(this);
    this.flags = new FlagsControllerD(this);
    this._helper = new AxesHelper2(1);
    this._found_point_post = new Vector32();
    this._on_object_before_render_bound = this._update.bind(this);
  }
  static type() {
    return "rivet";
  }
  create_object() {
    const mesh = new Mesh2();
    mesh.matrixAutoUpdate = false;
    return mesh;
  }
  initialize_node() {
    this.hierarchy_controller.initialize_node();
    this.add_post_dirty_hook("rivet_on_dirty", () => {
      this.cook_controller.cook_main_without_inputs();
    });
    this.object.add(this._helper);
    this.flags.display.add_hook(() => {
      this._helper.visible = this.flags.display.active;
    });
  }
  async cook() {
    await this._update_resolved_object();
    this._update_render_hook();
    this.cook_controller.end_cook();
  }
  _update_render_hook() {
    const mode = UPDATE_MODES[this.pv.update_mode];
    switch (mode) {
      case RivetUpdateMode.ON_RENDER: {
        return this._add_render_hook();
      }
      case RivetUpdateMode.MANUAL: {
        return this._remove_render_hook();
      }
    }
    TypeAssert.unreachable(mode);
  }
  _add_render_hook() {
    this.object.onBeforeRender = this._on_object_before_render_bound;
    this.object.frustumCulled = false;
  }
  _remove_render_hook() {
    this.object.onBeforeRender = () => {
    };
  }
  _update(renderer, scene, camera, geometry, material, group) {
    const resolved_object = this._resolved_object();
    if (resolved_object) {
      const geometry2 = resolved_object.geometry;
      if (geometry2) {
        const position_attrib = geometry2.attributes["position"];
        if (position_attrib) {
          const position_array = position_attrib.array;
          this._found_point_post.fromArray(position_array, this.pv.point_index * 3);
          resolved_object.updateWorldMatrix(true, false);
          resolved_object.localToWorld(this._found_point_post);
          this.object.matrix.makeTranslation(this._found_point_post.x, this._found_point_post.y, this._found_point_post.z);
        }
      }
    }
  }
  static PARAM_CALLBACK_update_resolved_object(node) {
    node._update_resolved_object();
  }
  async _update_resolved_object() {
    if (this.p.object.is_dirty) {
      await this.p.object.compute();
    }
    const node = this.p.object.found_node();
    if (node) {
      if (node.node_context() == NodeContext2.OBJ && node.type == GeoObjNode.type()) {
        const geo_node = node;
        this._resolved_sop_group = geo_node.children_display_controller.sop_group;
      } else {
        this.states.error.set("found node is not a geo node");
      }
    }
  }
  _resolved_object() {
    if (!this._resolved_sop_group) {
      return;
    }
    const object = this._resolved_sop_group.children[0];
    if (object) {
      return object;
    }
  }
  static PARAM_CALLBACK_update_update_mode(node) {
    node._update_render_hook();
  }
  static PARAM_CALLBACK_update(node) {
    node._update();
  }
}
