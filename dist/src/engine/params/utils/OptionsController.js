import lodash_compact from "lodash/compact";
import lodash_cloneDeep from "lodash/cloneDeep";
import lodash_isArray from "lodash/isArray";
import lodash_isBoolean from "lodash/isBoolean";
import lodash_isEqual from "lodash/isEqual";
import lodash_flatten from "lodash/flatten";
import {ParamType as ParamType2} from "../../poly/ParamType";
import {ParamEvent as ParamEvent2} from "../../poly/ParamEvent";
import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
const ASSET_REFERENCE_OPTION = "asset_reference";
const CALLBACK_OPTION = "callback";
const CALLBACK_STRING_OPTION = "callback_string";
const COMPUTE_ON_DIRTY = "compute_on_dirty";
const COOK_OPTION = "cook";
const DESKTOP_BROWSE_OPTION = "desktop_browse";
const FILE_TYPE_OPTION = "file_type";
const EXPRESSION = "expression";
const FOR_ENTITIES = "for_entities";
const LABEL = "label";
const LEVEL = "level";
const MENU = "menu";
const ENTRIES = "entries";
const MULTILINE_OPTION = "multiline";
const LANGUAGE_OPTION = "language";
const NODE_SELECTION = "node_selection";
const NODE_SELECTION_CONTEXT = "context";
const NODE_SELECTION_TYPES = "types";
const PARAM_SELECTION = "param_selection";
const DEPENDENT_ON_FOUND_NODE = "dependent_on_found_node";
const RANGE_OPTION = "range";
const RANGE_LOCKED_OPTION = "range_locked";
const STEP_OPTION = "step";
const SPARE_OPTION = "spare";
const TEXTURE_OPTION = "texture";
const ENV_OPTION = "env";
const HIDDEN_OPTION = "hidden";
const SHOW_LABEL_OPTION = "show_label";
const FIELD_OPTION = "field";
const VISIBLE_IF_OPTION = "visible_if";
const COLOR_CONVERSION = "conversion";
export var StringParamLanguage;
(function(StringParamLanguage2) {
  StringParamLanguage2["TYPESCRIPT"] = "typescript";
})(StringParamLanguage || (StringParamLanguage = {}));
export var DesktopFileType;
(function(DesktopFileType2) {
  DesktopFileType2["TEXTURE"] = "texture";
  DesktopFileType2["GEOMETRY"] = "geometry";
})(DesktopFileType || (DesktopFileType = {}));
export class OptionsController {
  constructor(_param) {
    this._param = _param;
    this._programatic_visible_state = true;
    this._update_visibility_and_remove_dirty_bound = this.update_visibility_and_remove_dirty.bind(this);
    this._ui_data_dependency_set = false;
  }
  set(options) {
    this._default_options = options;
    this._options = lodash_cloneDeep(this._default_options);
    this.post_set_options();
  }
  copy(options_controller) {
    this._default_options = lodash_cloneDeep(options_controller.default);
    this._options = lodash_cloneDeep(options_controller.current);
    this.post_set_options();
  }
  set_option(name, value) {
    this._options[name] = value;
    if (this._param.components) {
      for (let component of this._param.components) {
        component.options.set_option(name, value);
      }
    }
  }
  post_set_options() {
    this._handle_compute_on_dirty();
    if (this.asset_reference && this.param.type == ParamType2.STRING) {
      this.param.scene.assets_controller.register_param(this.param);
    }
  }
  get param() {
    return this._param;
  }
  get node() {
    return this._param.node;
  }
  get default() {
    return this._default_options;
  }
  get current() {
    return this._options;
  }
  get has_options_overridden() {
    return !lodash_isEqual(this._options, this._default_options);
  }
  get overridden_options() {
    const overriden = {};
    const option_names = Object.keys(this._options);
    for (let option_name of option_names) {
      if (!lodash_isEqual(this._options[option_name], this._default_options[option_name])) {
        const cloned_option = lodash_cloneDeep(this._options[option_name]);
        Object.assign(overriden, {[option_name]: cloned_option});
      }
    }
    return overriden;
  }
  get overridden_option_names() {
    return Object.keys(this.overridden_options);
  }
  get asset_reference() {
    return this._options[ASSET_REFERENCE_OPTION] || false;
  }
  get compute_on_dirty() {
    return this._options[COMPUTE_ON_DIRTY] || false;
  }
  _handle_compute_on_dirty() {
    if (this.compute_on_dirty) {
      if (!this._compute_on_dirty_callback_added) {
        this.param.add_post_dirty_hook("compute_on_dirty", this._compute_param.bind(this));
        this._compute_on_dirty_callback_added = true;
      }
    }
  }
  async _compute_param() {
    await this.param.compute();
  }
  has_callback() {
    return this._options[CALLBACK_OPTION] != null || this._options[CALLBACK_STRING_OPTION] != null;
  }
  execute_callback() {
    if (!this.node) {
      return;
    }
    if (!this.node.scene.loading_controller.loaded) {
      return;
    }
    const callback = this.get_callback();
    if (callback != null) {
      if (this.param.parent_param) {
        this.param.parent_param.options.execute_callback();
      } else {
        callback(this.node, this.param);
      }
    }
  }
  get_callback() {
    if (this.has_callback()) {
      return this._options[CALLBACK_OPTION] = this._options[CALLBACK_OPTION] || this.create_callback_from_string();
    }
  }
  create_callback_from_string() {
    const callback_string = this._options[CALLBACK_STRING_OPTION];
    if (callback_string) {
      const callback_function = new Function("node", "scene", "window", "location", callback_string);
      return () => {
        callback_function(this.node, this.node.scene, null, null);
      };
    }
  }
  color_conversion() {
    return this._options[COLOR_CONVERSION];
  }
  makes_node_dirty_when_dirty() {
    let cook_options;
    if (this.param.parent_param != null) {
      return false;
    }
    let value = true;
    if ((cook_options = this._options[COOK_OPTION]) != null) {
      value = cook_options;
    }
    return value;
  }
  get desktop_browse_option() {
    return this._options[DESKTOP_BROWSE_OPTION];
  }
  get desktop_browse_allowed() {
    return this.desktop_browse_option != null;
  }
  desktop_browse_file_type() {
    if (this.desktop_browse_option) {
      return this.desktop_browse_option[FILE_TYPE_OPTION];
    } else {
      return null;
    }
  }
  get is_expression_for_entities() {
    const expr_option = this._options[EXPRESSION];
    if (expr_option) {
      return expr_option[FOR_ENTITIES] || false;
    }
    return false;
  }
  get level() {
    return this._options[LEVEL] || 0;
  }
  get has_menu() {
    return this.menu_options != null;
  }
  get menu_options() {
    return this._options[MENU];
  }
  get menu_entries() {
    if (this.menu_options) {
      return this.menu_options[ENTRIES];
    } else {
      return [];
    }
  }
  get has_menu_radio() {
    return this.has_menu;
  }
  get is_multiline() {
    return this._options[MULTILINE_OPTION] === true;
  }
  get language() {
    return this._options[LANGUAGE_OPTION];
  }
  get is_code() {
    return this.language != null;
  }
  get node_selection_options() {
    return this._options[NODE_SELECTION];
  }
  get node_selection_context() {
    if (this.node_selection_options) {
      return this.node_selection_options[NODE_SELECTION_CONTEXT];
    }
  }
  get node_selection_types() {
    if (this.node_selection_options) {
      return this.node_selection_options[NODE_SELECTION_TYPES];
    }
  }
  dependent_on_found_node() {
    if (DEPENDENT_ON_FOUND_NODE in this._options) {
      return this._options[DEPENDENT_ON_FOUND_NODE];
    } else {
      return true;
    }
  }
  is_selecting_param() {
    return this.param_selection_options != null;
  }
  get param_selection_options() {
    return this._options[PARAM_SELECTION];
  }
  get param_selection_type() {
    if (this.param_selection_options) {
      const type_or_boolean = this.param_selection_options;
      if (!lodash_isBoolean(type_or_boolean)) {
        return type_or_boolean;
      }
    }
  }
  get range() {
    return this._options[RANGE_OPTION] || [0, 1];
  }
  get step() {
    return this._options[STEP_OPTION];
  }
  range_locked() {
    return this._options[RANGE_LOCKED_OPTION] || [false, false];
  }
  ensure_in_range(value) {
    const range = this.range;
    if (value >= range[0] && value <= range[1]) {
      return value;
    } else {
      if (value < range[0]) {
        return this.range_locked()[0] === true ? range[0] : value;
      } else {
        return this.range_locked()[1] === true ? range[1] : value;
      }
    }
  }
  get is_spare() {
    return this._options[SPARE_OPTION] || false;
  }
  get texture_options() {
    return this._options[TEXTURE_OPTION];
  }
  texture_as_env() {
    const texture_options = this.texture_options;
    if (texture_options != null) {
      return texture_options[ENV_OPTION] === true;
    }
    return false;
  }
  get is_hidden() {
    return this._options[HIDDEN_OPTION] === true || this._programatic_visible_state === false;
  }
  get is_visible() {
    return !this.is_hidden;
  }
  set_visible_state(state) {
    this._options[HIDDEN_OPTION] = !state;
    this.param.emit(ParamEvent2.VISIBLE_UPDATED);
  }
  get label() {
    return this._options[LABEL];
  }
  get is_label_hidden() {
    const type = this.param.type;
    return this._options[SHOW_LABEL_OPTION] === false || type === ParamType2.BUTTON || type === ParamType2.SEPARATOR || type === ParamType2.BOOLEAN && this.is_field_hidden();
  }
  is_field_hidden() {
    return this._options[FIELD_OPTION] === false;
  }
  ui_data_depends_on_other_params() {
    return VISIBLE_IF_OPTION in this._options;
  }
  visibility_predecessors() {
    const visibility_options = this._options[VISIBLE_IF_OPTION];
    if (!visibility_options) {
      return [];
    }
    let predecessor_names = [];
    if (lodash_isArray(visibility_options)) {
      predecessor_names = lodash_flatten(visibility_options.map((options) => Object.keys(options)));
    } else {
      predecessor_names = Object.keys(visibility_options);
    }
    const node = this.param.node;
    return lodash_compact(predecessor_names.map((name) => {
      const param = node.params.get(name);
      if (param) {
        return param;
      } else {
        console.error(`param ${name} not found as visibility condition for ${this.param.name} in node ${this.param.node.type}`);
      }
    }));
  }
  set_ui_data_dependency() {
    if (this._ui_data_dependency_set) {
      return;
    }
    this._ui_data_dependency_set = true;
    const predecessors = this.visibility_predecessors();
    if (predecessors.length > 0) {
      this._visibility_graph_node = new CoreGraphNode2(this.param.scene, "param_visibility");
      for (let predecessor of predecessors) {
        this._visibility_graph_node.add_graph_input(predecessor);
      }
      this._visibility_graph_node.add_post_dirty_hook("_update_visibility_and_remove_dirty", this._update_visibility_and_remove_dirty_bound);
    }
  }
  update_visibility_and_remove_dirty() {
    this.update_visibility();
    this.param.remove_dirty_state();
  }
  async update_visibility() {
    const options = this._options[VISIBLE_IF_OPTION];
    if (options) {
      const params = this.visibility_predecessors();
      const promises = params.map((p) => p.compute());
      this._programatic_visible_state = false;
      await Promise.all(promises);
      if (lodash_isArray(options)) {
        for (let options_set of options) {
          const satisfied_values = params.filter((param) => param.value == options_set[param.name]);
          if (satisfied_values.length == params.length) {
            this._programatic_visible_state = true;
          }
        }
      } else {
        const satisfied_values = params.filter((param) => param.value == options[param.name]);
        this._programatic_visible_state = satisfied_values.length == params.length;
      }
      this.param.emit(ParamEvent2.VISIBLE_UPDATED);
    }
  }
}
