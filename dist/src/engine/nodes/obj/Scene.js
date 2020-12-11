import {TypedObjNode} from "./_Base";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {Fog as Fog2} from "three/src/scenes/Fog";
import {FogExp2 as FogExp22} from "three/src/scenes/FogExp2";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
var BackgroundMode;
(function(BackgroundMode2) {
  BackgroundMode2["NONE"] = "none";
  BackgroundMode2["COLOR"] = "color";
  BackgroundMode2["TEXTURE"] = "texture";
})(BackgroundMode || (BackgroundMode = {}));
const BACKGROUND_MODES = [BackgroundMode.NONE, BackgroundMode.COLOR, BackgroundMode.TEXTURE];
var FogType;
(function(FogType2) {
  FogType2["LINEAR"] = "linear";
  FogType2["EXPONENTIAL"] = "exponential";
})(FogType || (FogType = {}));
const FOG_TYPES = [FogType.LINEAR, FogType.EXPONENTIAL];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class SceneObjParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.auto_update = ParamConfig.BOOLEAN(1);
    this.background_mode = ParamConfig.INTEGER(BACKGROUND_MODES.indexOf(BackgroundMode.NONE), {
      menu: {
        entries: BACKGROUND_MODES.map((mode, i) => {
          return {name: mode, value: i};
        })
      }
    });
    this.bg_color = ParamConfig.COLOR([0, 0, 0], {
      visible_if: {background_mode: BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)}
    });
    this.bg_texture = ParamConfig.OPERATOR_PATH("", {
      visible_if: {background_mode: BACKGROUND_MODES.indexOf(BackgroundMode.TEXTURE)},
      node_selection: {
        context: NodeContext2.COP
      },
      dependent_on_found_node: false
    });
    this.use_environment = ParamConfig.BOOLEAN(0);
    this.environment = ParamConfig.OPERATOR_PATH("", {
      visible_if: {use_environment: 1},
      node_selection: {
        context: NodeContext2.COP
      },
      dependent_on_found_node: false
    });
    this.use_fog = ParamConfig.BOOLEAN(0);
    this.fog_type = ParamConfig.INTEGER(FOG_TYPES.indexOf(FogType.EXPONENTIAL), {
      visible_if: {use_fog: 1},
      menu: {
        entries: FOG_TYPES.map((mode, i) => {
          return {name: mode, value: i};
        })
      }
    });
    this.fog_color = ParamConfig.COLOR([1, 1, 1], {visible_if: {use_fog: 1}});
    this.fog_near = ParamConfig.FLOAT(1, {
      range: [0, 100],
      range_locked: [true, false],
      visible_if: {use_fog: 1, fog_type: FOG_TYPES.indexOf(FogType.LINEAR)}
    });
    this.fog_far = ParamConfig.FLOAT(100, {
      range: [0, 100],
      range_locked: [true, false],
      visible_if: {use_fog: 1, fog_type: FOG_TYPES.indexOf(FogType.LINEAR)}
    });
    this.fog_density = ParamConfig.FLOAT(25e-5, {
      visible_if: {use_fog: 1, fog_type: FOG_TYPES.indexOf(FogType.EXPONENTIAL)}
    });
    this.use_override_material = ParamConfig.BOOLEAN(0);
    this.override_material = ParamConfig.OPERATOR_PATH("/MAT/mesh_standard1", {
      visible_if: {use_override_material: 1},
      node_selection: {
        context: NodeContext2.MAT
      },
      dependent_on_found_node: false
    });
  }
}
const ParamsConfig2 = new SceneObjParamConfig();
export class SceneObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.hierarchy_controller = new HierarchyController2(this);
  }
  static type() {
    return "scene";
  }
  create_object() {
    const scene = new Scene2();
    scene.matrixAutoUpdate = false;
    return scene;
  }
  initialize_node() {
    this.hierarchy_controller.initialize_node();
  }
  cook() {
    if (this.pv.auto_update != this.object.autoUpdate) {
      this.object.autoUpdate = this.pv.auto_update;
    }
    this._update_background();
    this._update_fog();
    this._update_enviromment();
    this._update_material_override();
    this.cook_controller.end_cook();
  }
  _update_background() {
    if (this.pv.background_mode == BACKGROUND_MODES.indexOf(BackgroundMode.NONE)) {
      this.object.background = null;
    } else {
      if (this.pv.background_mode == BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)) {
        this.object.background = this.pv.bg_color;
      } else {
        const node = this.p.bg_texture.found_node();
        if (node) {
          if (node.node_context() == NodeContext2.COP) {
            node.request_container().then((container) => {
              this.object.background = container.texture();
            });
          } else {
            this.states.error.set("bg_texture node is not a texture");
          }
        } else {
          this.states.error.set("bg_texture node not found");
        }
      }
    }
  }
  _update_fog() {
    if (this.pv.use_fog) {
      if (this.pv.fog_type == FOG_TYPES.indexOf(FogType.LINEAR)) {
        this.object.fog = this.fog;
        this.fog.color = this.pv.fog_color;
        this.fog.near = this.pv.fog_near;
        this.fog.far = this.pv.fog_far;
      } else {
        this.object.fog = this.fog_exp2;
        this.fog_exp2.color = this.pv.fog_color;
        this.fog_exp2.density = this.pv.fog_density;
      }
    } else {
      const current_fog = this.object.fog;
      if (current_fog) {
        this.object.fog = null;
      }
    }
  }
  get fog() {
    return this._fog = this._fog || new Fog2(16777215, this.pv.fog_near, this.pv.fog_far);
  }
  get fog_exp2() {
    return this._fog_exp2 = this._fog_exp2 || new FogExp22(16777215, this.pv.fog_density);
  }
  _update_enviromment() {
    if (this.pv.use_environment) {
      const node = this.p.environment.found_node();
      if (node) {
        if (node.node_context() == NodeContext2.COP) {
          node.request_container().then((container) => {
            this.object.environment = container.texture();
          });
        } else {
          this.states.error.set("bg_texture node is not a texture");
        }
      } else {
        this.states.error.set("bg_texture node not found");
      }
    } else {
      this.object.environment = null;
    }
  }
  _update_material_override() {
    if (this.pv.use_override_material) {
      const node = this.p.override_material.found_node();
      if (node) {
        if (node.node_context() == NodeContext2.MAT) {
          node.request_container().then((container) => {
            this.object.overrideMaterial = container.material();
          });
        } else {
          this.states.error.set("bg_texture node is not a material");
        }
      } else {
        this.states.error.set("bg_texture node not found");
      }
    } else {
      this.object.overrideMaterial = null;
    }
  }
}
