import lodash_chunk from "lodash/chunk";
import {CoreString} from "../../../core/String";
import {FeatureConverter as FeatureConverter2} from "../../../core/mapbox/FeatureConverter";
const DEFAULT_LIST = [
  "road-primary",
  "road-secondary-tertiary",
  "road-street"
].join(" ");
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {MapboxListenerParamConfig, MapboxListenerSopNode} from "./utils/mapbox/MapboxListener";
import {MapUtils as MapUtils2} from "../../../core/MapUtils";
class MapboxLayerSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
  constructor() {
    super(...arguments);
    this.layers = ParamConfig.STRING(DEFAULT_LIST);
  }
}
const ParamsConfig2 = new MapboxLayerSopParamsConfig();
export class MapboxLayerSopNode extends MapboxListenerSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._features_by_name = new Map();
  }
  static type() {
    return "mapbox_layer";
  }
  cook() {
    this._mapbox_listener.cook();
  }
  _post_init_controller() {
    if (!this._camera_node) {
      return;
    }
    const first_map = this._camera_node.first_map();
    if (first_map == null) {
      this.states.error.set("map not initialized yet");
      return;
    }
    const layer_names = CoreString.attrib_names(this.pv.layers);
    const existing_layer_names = [];
    for (let layer_name of layer_names) {
      if (first_map.getLayer(layer_name)) {
        existing_layer_names.push(layer_name);
      } else {
        this.states.error.set(`layer ${layer_name} does not exist`);
        return;
      }
    }
    const features = first_map.queryRenderedFeatures(void 0, {
      layers: existing_layer_names
    });
    const objects = [];
    if (features) {
      const features_by_name = this._group_features_by_name(features);
      features_by_name.forEach((features_for_name, name) => {
        const converter = new FeatureConverter2(this, name, features_for_name);
        const new_object = converter.create_object();
        if (new_object) {
          objects.push(new_object);
        }
      });
    }
    this.set_objects(objects);
  }
  _group_features_by_name(features) {
    this._features_by_name.clear();
    features.forEach((feature) => {
      const name = this._feature_name(feature);
      if (name) {
        MapUtils2.push_on_array_at_entry(this._features_by_name, name, feature);
      }
    });
    return this._features_by_name;
  }
  _feature_name(feature) {
    const properties = feature["properties"];
    let name;
    if (properties) {
      name = properties["name"] || properties["name_en"];
      if (name == null) {
        name = this._id_from_feature(feature);
      }
    }
    return name;
  }
  _id_from_feature(feature) {
    const json_str = JSON.stringify(feature.geometry).replace(/{|}|"|:|\[|\]|,|\./g, "");
    const json_str_elements = json_str.split("");
    const letters_count = 30;
    const chunks = lodash_chunk(json_str_elements, json_str_elements.length / letters_count);
    const first_elements = chunks.map((c) => c[0]);
    return first_elements.join("");
  }
}
