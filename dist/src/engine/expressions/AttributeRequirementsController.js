export class AttributeRequirementsController {
  constructor() {
  }
  reset() {
    if (this._attribute_names) {
      this._attribute_names.clear();
    }
  }
  assign_attributes_lines() {
    if (this._attribute_names) {
      const lines = [];
      this._attribute_names?.forEach((attribute_name) => {
        lines.push(AttributeRequirementsController.assign_attribute_line(attribute_name));
      });
      return lines.join(";\n");
    } else {
      return "";
    }
  }
  assign_arrays_lines() {
    if (this._attribute_names) {
      const lines = [];
      this._attribute_names?.forEach((attribute_name) => {
        lines.push(AttributeRequirementsController.assign_item_size_line(attribute_name));
        lines.push(AttributeRequirementsController.assign_array_line(attribute_name));
      });
      return lines.join(";\n");
    } else {
      return "";
    }
  }
  attribute_presence_check_line() {
    if (this._attribute_names) {
      const var_names = [];
      this._attribute_names?.forEach((attribute_name) => {
        const var_name = AttributeRequirementsController.var_attribute(attribute_name);
        var_names.push(var_name);
      });
      if (var_names.length > 0) {
        return var_names.join(" && ");
      }
    }
    return "true";
  }
  add(attribute_name) {
    this._attribute_names = this._attribute_names || new Set();
    this._attribute_names.add(attribute_name);
  }
  static assign_attribute_line(attribute_name) {
    const var_attribute = this.var_attribute(attribute_name);
    return `const ${var_attribute} = entities[0].geometry().attributes['${attribute_name}']`;
  }
  static assign_item_size_line(attribute_name) {
    const var_attribute = this.var_attribute(attribute_name);
    const var_attribute_size = this.var_attribute_size(attribute_name);
    return `const ${var_attribute_size} = ${var_attribute}.itemSize`;
  }
  static assign_array_line(attribute_name) {
    const var_attribute = this.var_attribute(attribute_name);
    const var_array = this.var_array(attribute_name);
    return `const ${var_array} = ${var_attribute}.array`;
  }
  static var_attribute(attribute_name) {
    return `attrib_${attribute_name}`;
  }
  static var_attribute_size(attribute_name) {
    return `attrib_size_${attribute_name}`;
  }
  static var_array(attribute_name) {
    return `array_${attribute_name}`;
  }
  var_attribute_size(attribute_name) {
    return AttributeRequirementsController.var_attribute_size(attribute_name);
  }
  var_array(attribute_name) {
    return AttributeRequirementsController.var_array(attribute_name);
  }
}
