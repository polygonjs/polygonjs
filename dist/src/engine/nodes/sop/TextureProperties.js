import {TypedSopNode} from "./_Base";
import {TexturePropertiesSopOperation} from "../../../core/operations/sop/TextureProperties";
import {MAG_FILTER_MENU_ENTRIES, MIN_FILTER_MENU_ENTRIES} from "../../../core/cop/ConstantFilter";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = TexturePropertiesSopOperation.DEFAULT_PARAMS;
class TexturePropertiesSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children);
    this.separator = ParamConfig.SEPARATOR();
    this.tanisotropy = ParamConfig.BOOLEAN(DEFAULT.tanisotropy);
    this.use_renderer_max_anisotropy = ParamConfig.BOOLEAN(DEFAULT.use_renderer_max_anisotropy, {
      visible_if: {tanisotropy: 1}
    });
    this.anisotropy = ParamConfig.INTEGER(DEFAULT.anisotropy, {
      visible_if: {tanisotropy: 1, use_renderer_max_anisotropy: 0},
      range: [0, 32],
      range_locked: [true, false]
    });
    this.tmin_filter = ParamConfig.BOOLEAN(0);
    this.min_filter = ParamConfig.INTEGER(DEFAULT.min_filter, {
      visible_if: {tmin_filter: 1},
      menu: {
        entries: MIN_FILTER_MENU_ENTRIES
      }
    });
    this.tmag_filter = ParamConfig.BOOLEAN(0);
    this.mag_filter = ParamConfig.INTEGER(DEFAULT.mag_filter, {
      visible_if: {tmag_filter: 1},
      menu: {
        entries: MAG_FILTER_MENU_ENTRIES
      }
    });
  }
}
const ParamsConfig2 = new TexturePropertiesSopParamsConfig();
export class TexturePropertiesSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "texture_properties";
  }
  static displayed_input_names() {
    return ["objects with textures to change properties of"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(TexturePropertiesSopOperation.INPUT_CLONED_STATE);
  }
  async cook(input_contents) {
    this._operation = this._operation || new TexturePropertiesSopOperation(this.scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}
