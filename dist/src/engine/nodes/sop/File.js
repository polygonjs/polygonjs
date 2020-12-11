import {TypedSopNode} from "./_Base";
import {CoreLoaderGeometry} from "../../../core/loader/Geometry";
import {DesktopFileType} from "../../params/utils/OptionsController";
import {FileSopOperation} from "../../../core/operations/sop/File";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = FileSopOperation.DEFAULT_PARAMS;
class FileSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.url = ParamConfig.STRING(DEFAULT.url, {
      desktop_browse: {file_type: DesktopFileType.GEOMETRY},
      asset_reference: true
    });
    this.reload = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        FileSopNode.PARAM_CALLBACK_reload(node);
      }
    });
  }
}
const ParamsConfig2 = new FileSopParamsConfig();
export class FileSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "file";
  }
  async required_modules() {
    if (this.p.url.is_dirty) {
      await this.p.url.compute();
    }
    const ext = CoreLoaderGeometry.get_extension(this.pv.url || "");
    return CoreLoaderGeometry.module_names(ext);
  }
  initialize_node() {
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.url], () => {
          const url = this.pv.url;
          if (url) {
            const elements = url.split("/");
            return elements[elements.length - 1];
          } else {
            return "";
          }
        });
      });
    });
  }
  async cook(input_contents) {
    this._operation = this._operation || new FileSopOperation(this.scene, this.states);
    const core_group = await this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
  static PARAM_CALLBACK_reload(node) {
    node.param_callback_reload();
  }
  param_callback_reload() {
    this.p.url.set_dirty();
  }
}
