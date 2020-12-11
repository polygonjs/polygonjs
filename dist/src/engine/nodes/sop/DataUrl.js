import {TypedSopNode} from "./_Base";
import {JsonDataLoader} from "../../../core/loader/geometry/JsonData";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CsvLoader} from "../../../core/loader/geometry/Csv";
import {ObjectType} from "../../../core/geometry/Constant";
export var DataType;
(function(DataType2) {
  DataType2["JSON"] = "json";
  DataType2["CSV"] = "csv";
})(DataType || (DataType = {}));
export const DATA_TYPES = [DataType.JSON, DataType.CSV];
class DataUrlSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.data_type = ParamConfig.INTEGER(DATA_TYPES.indexOf(DataType.JSON), {
      menu: {
        entries: DATA_TYPES.map((t, i) => {
          return {
            name: t,
            value: i
          };
        })
      }
    });
    this.url = ParamConfig.STRING("/examples/sop/data_url/basic.json", {
      asset_reference: true
    });
    this.json_data_keys_prefix = ParamConfig.STRING("", {
      visible_if: {data_type: DATA_TYPES.indexOf(DataType.JSON)}
    });
    this.skip_entries = ParamConfig.STRING("", {
      visible_if: {data_type: DATA_TYPES.indexOf(DataType.JSON)}
    });
    this.convert = ParamConfig.BOOLEAN(0, {
      visible_if: {data_type: DATA_TYPES.indexOf(DataType.JSON)}
    });
    this.convert_to_numeric = ParamConfig.STRING("", {
      visible_if: {
        data_type: DATA_TYPES.indexOf(DataType.JSON),
        convert: 1
      }
    });
    this.read_attrib_names_from_file = ParamConfig.BOOLEAN(1, {
      visible_if: {data_type: DATA_TYPES.indexOf(DataType.CSV)}
    });
    this.attrib_names = ParamConfig.STRING("height scale", {
      visible_if: {
        data_type: DATA_TYPES.indexOf(DataType.CSV),
        read_attrib_names_from_file: 0
      }
    });
    this.reload = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        DataUrlSopNode.PARAM_CALLBACK_reload(node, param);
      }
    });
  }
}
const ParamsConfig2 = new DataUrlSopParamsConfig();
export class DataUrlSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "data_url";
  }
  async cook() {
    switch (DATA_TYPES[this.pv.data_type]) {
      case DataType.JSON:
        return this._load_json();
      case DataType.CSV:
        return this._load_csv();
    }
  }
  _url() {
    const assets_root = this.scene.assets_controller.assets_root();
    if (assets_root) {
      return `${assets_root}${this.pv.url}`;
    } else {
      return this.pv.url;
    }
  }
  _load_json() {
    const loader = new JsonDataLoader({
      data_keys_prefix: this.pv.json_data_keys_prefix,
      skip_entries: this.pv.skip_entries,
      do_convert: this.pv.convert,
      convert_to_numeric: this.pv.convert_to_numeric
    });
    loader.load(this._url(), this._on_load.bind(this), void 0, this._on_error.bind(this));
  }
  _on_load(geometry) {
    this.set_geometry(geometry, ObjectType.POINTS);
  }
  _on_error(error) {
    this.states.error.set(`could not load geometry from ${this._url()} (${error})`);
    this.cook_controller.end_cook();
  }
  async _load_csv() {
    const attrib_names = this.pv.read_attrib_names_from_file ? void 0 : this.pv.attrib_names.split(" ");
    const loader = new CsvLoader(attrib_names);
    const geometry = await loader.load(this._url());
    if (geometry) {
      this.set_geometry(geometry, ObjectType.POINTS);
    } else {
      this.states.error.set("could not generate points");
    }
  }
  static PARAM_CALLBACK_reload(node, param) {
    node.param_callback_reload();
  }
  param_callback_reload() {
    this.p.url.set_dirty();
  }
}
