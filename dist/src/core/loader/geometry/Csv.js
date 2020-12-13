import lodash_isString from "lodash/isString";
import lodash_last from "lodash/last";
import lodash_flatten from "lodash/flatten";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {CoreAttributeData} from "../../geometry/AttributeData";
import {CoreAttribute} from "../../geometry/Attribute";
import {AttribType} from "../../geometry/Constant";
import {CoreGeometry} from "../../geometry/Geometry";
const POSITION = "position";
const CsvLoader2 = class {
  constructor(attribute_names) {
    this.attribute_names = attribute_names;
    this.attribute_names_from_first_line = false;
    this.lines = [];
    this.points_count = 0;
    this.attribute_values_by_name = {};
    this.attribute_data_by_name = {};
    this._loading = false;
    if (!this.attribute_names) {
      this.attribute_names_from_first_line = true;
    }
  }
  async load(url) {
    if (this._loading) {
      console.warn("is already loading");
      return;
    }
    this._loading = true;
    this.points_count = 0;
    await this.load_data(url);
    this.infer_types();
    this.read_values();
    const geometry = this.create_points();
    return geometry;
  }
  async load_data(url) {
    const response = await fetch(url);
    const text = await response.text();
    this.lines = text.split("\n");
    if (!this.attribute_names) {
      this.attribute_names = this.lines[0].split(CsvLoader2.SEPARATOR);
    }
    this.attribute_names = this.attribute_names.map((name) => CoreAttribute.remap_name(name));
    for (let attribute_name of this.attribute_names) {
      this.attribute_values_by_name[attribute_name] = [];
    }
  }
  infer_types() {
    const first_values_index = this.attribute_names_from_first_line ? 1 : 0;
    const first_line = this.lines[first_values_index];
    let line_attribute_values = first_line.split(CsvLoader2.SEPARATOR);
    for (let i = 0; i < line_attribute_values.length; i++) {
      const attribute_name = this.attribute_names[i];
      const attribute_value = line_attribute_values[i];
      const value = this._value_from_line_element(attribute_value);
      this.attribute_data_by_name[attribute_name] = CoreAttributeData.from_value(value);
    }
  }
  _value_from_line_element(attribute_value) {
    if (lodash_isString(attribute_value)) {
      if (`${parseFloat(attribute_value)}` === attribute_value) {
        return parseFloat(attribute_value);
      } else if (attribute_value[0] === "[" && lodash_last(attribute_value) === "]") {
        const attribute_value_within_brackets = attribute_value.substring(1, attribute_value.length - 1);
        const elements_s = attribute_value_within_brackets.split(CsvLoader2.VECTOR_SEPARATOR);
        return elements_s.map((element_s) => parseFloat(element_s));
      } else {
        return attribute_value;
      }
    } else {
      return attribute_value;
    }
  }
  read_values() {
    if (!this.attribute_names) {
      return;
    }
    const first_values_index = this.attribute_names_from_first_line ? 1 : 0;
    let line;
    for (let line_index = first_values_index; line_index < this.lines.length; line_index++) {
      line = this.lines[line_index];
      const line_attribute_values = line.split(CsvLoader2.SEPARATOR);
      if (line_attribute_values.length >= this.attribute_names.length) {
        for (let i = 0; i < line_attribute_values.length; i++) {
          const attribute_name = this.attribute_names[i];
          if (attribute_name) {
            const attribute_value = line_attribute_values[i];
            const value = this._value_from_line_element(attribute_value);
            this.attribute_values_by_name[attribute_name].push(value);
          }
        }
        this.points_count += 1;
      }
    }
    if (!this.attribute_values_by_name[POSITION]) {
      const positions = new Array(this.points_count * 3);
      positions.fill(0);
      this.attribute_values_by_name[POSITION] = positions;
      this.attribute_data_by_name[POSITION] = new CoreAttributeData(3, AttribType.NUMERIC);
      this.attribute_names.push(POSITION);
    }
  }
  create_points() {
    if (!this.attribute_names) {
      return;
    }
    const geometry = new BufferGeometry2();
    const core_geometry = new CoreGeometry(geometry);
    for (let attribute_name of this.attribute_names) {
      const attribute_values = lodash_flatten(this.attribute_values_by_name[attribute_name]);
      const size = this.attribute_data_by_name[attribute_name].size();
      const type = this.attribute_data_by_name[attribute_name].type();
      if (type == AttribType.STRING) {
        const index_data = CoreAttribute.array_to_indexed_arrays(attribute_values);
        core_geometry.set_indexed_attribute(attribute_name, index_data["values"], index_data["indices"]);
      } else {
        geometry.setAttribute(attribute_name, new Float32BufferAttribute(attribute_values, size));
      }
    }
    const indices = new Array(this.points_count);
    for (let i = 0; i < this.points_count; i++) {
      indices.push(i);
    }
    geometry.setIndex(indices);
    return geometry;
  }
};
export let CsvLoader = CsvLoader2;
CsvLoader.SEPARATOR = ",";
CsvLoader.VECTOR_SEPARATOR = ",";
