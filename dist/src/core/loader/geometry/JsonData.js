import lodash_isArray from "lodash/isArray";
import lodash_isObject from "lodash/isObject";
import lodash_isString from "lodash/isString";
import lodash_flatten from "lodash/flatten";
import {Points as Points2} from "three/src/objects/Points";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
const THREE = {BufferGeometry: BufferGeometry2, Float32BufferAttribute, Points: Points2};
import {CoreString} from "../../String";
import {CoreGeometry} from "../../geometry/Geometry";
import {AttribType} from "../../geometry/Constant";
import {CoreAttributeData} from "../../geometry/AttributeData";
import {CoreAttribute} from "../../geometry/Attribute";
import {Poly as Poly2} from "../../../engine/Poly";
const DEEP_ATTRIB_SEPARATOR = ":";
export class JsonDataLoader {
  constructor(options = {}) {
    this._attribute_datas_by_name = {};
    this._options = {};
    this._options.data_keys_prefix = options.data_keys_prefix;
    this._options.skip_entries = options.skip_entries;
    this._options.do_convert = options.do_convert || false;
    this._options.convert_to_numeric = options.convert_to_numeric;
  }
  load(url, success_callback, progress_callback, error_callback) {
    fetch(url).then(async (response) => {
      this._json = await response.json();
      if (this._options.data_keys_prefix != null && this._options.data_keys_prefix != "") {
        this._json = this.get_prefixed_json(this._json, this._options.data_keys_prefix.split("."));
      }
      const object = this.create_object();
      success_callback(object);
    }).catch((error) => {
      Poly2.error("error", error);
      error_callback(error);
    });
  }
  get_prefixed_json(json, prefixes) {
    if (prefixes.length == 0) {
      return json;
    } else {
      const first_prefix = prefixes.shift();
      if (first_prefix) {
        return this.get_prefixed_json(json[first_prefix], prefixes);
      }
    }
    return [];
  }
  set_json(json) {
    return this._json = json;
  }
  create_object() {
    const geometry = new THREE.BufferGeometry();
    const core_geo = new CoreGeometry(geometry);
    if (this._json != null) {
      const points_count = this._json.length;
      core_geo.init_position_attribute(points_count);
      this._find_attributes();
      const convert_to_numeric_masks = CoreString.attrib_names(this._options.convert_to_numeric || "");
      for (let attrib_name of Object.keys(this._attribute_datas_by_name)) {
        const geo_attrib_name = CoreAttribute.remap_name(attrib_name);
        let attrib_values = lodash_flatten(this._attribute_values_for_name(attrib_name));
        const data = this._attribute_datas_by_name[attrib_name];
        const size = data.size();
        if (data.type() === AttribType.STRING) {
          if (this._options.do_convert && CoreString.matches_one_mask(attrib_name, convert_to_numeric_masks)) {
            const numerical_attrib_values = attrib_values.map((v) => {
              if (lodash_isString(v)) {
                return parseFloat(v) || 0;
              } else {
                return v;
              }
            });
            geometry.setAttribute(geo_attrib_name, new THREE.Float32BufferAttribute(numerical_attrib_values, size));
          } else {
            const index_data = CoreAttribute.array_to_indexed_arrays(attrib_values);
            core_geo.set_indexed_attribute(geo_attrib_name, index_data["values"], index_data["indices"]);
          }
        } else {
          const numerical_attrib_values = attrib_values;
          geometry.setAttribute(geo_attrib_name, new THREE.Float32BufferAttribute(numerical_attrib_values, size));
        }
      }
    }
    return geometry;
  }
  _find_attributes() {
    let first_pt;
    const masks = CoreString.attrib_names(this._options.skip_entries || "");
    if (this._json) {
      if ((first_pt = this._json[0]) != null) {
        for (let attrib_name of Object.keys(first_pt)) {
          const attrib_value = first_pt[attrib_name];
          if (this._value_has_subentries(attrib_value)) {
            for (let key of Object.keys(attrib_value)) {
              const deep_attrib_name = [attrib_name, key].join(DEEP_ATTRIB_SEPARATOR);
              const deep_attrib_value = attrib_value[attrib_name];
              if (!CoreString.matches_one_mask(deep_attrib_name, masks)) {
                this._attribute_datas_by_name[deep_attrib_name] = CoreAttributeData.from_value(deep_attrib_value);
              }
            }
          } else {
            if (!CoreString.matches_one_mask(attrib_name, masks)) {
              this._attribute_datas_by_name[attrib_name] = CoreAttributeData.from_value(attrib_value);
            }
          }
        }
      }
    }
  }
  _attribute_values_for_name(attrib_name) {
    if (this._json) {
      return this._json.map((json_element) => {
        const prefix = attrib_name.split(DEEP_ATTRIB_SEPARATOR)[0];
        const value = json_element[prefix];
        if (this._value_has_subentries(value)) {
          const deep_attrib_name = attrib_name.substring(prefix.length + 1);
          return value[deep_attrib_name] || 0;
        } else {
          return value || 0;
        }
      });
    } else {
      return [];
    }
  }
  _value_has_subentries(value) {
    return lodash_isObject(value) && !lodash_isArray(value);
  }
}
