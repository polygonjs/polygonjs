import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
import lodash_isString from "lodash/isString";
import lodash_isNumber from "lodash/isNumber";
import {CSS2DObject as CSS2DObject2} from "../../../modules/core/objects/CSS2DObject";
import {CoreString} from "../../../core/String";
const ATTRIBUTE_NAME = {
  id: "id",
  class_name: "class",
  html: "html"
};
const Css2DObjectSopOperation2 = class extends BaseSopOperation {
  static type() {
    return "css2d_object";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    if (core_group) {
      const objects = this._create_objects_from_input_points(core_group, params);
      return this.create_core_group_from_objects(objects);
    } else {
      const object = this._create_object_from_scratch(params);
      return this.create_core_group_from_objects([object]);
    }
  }
  _create_objects_from_input_points(core_group, params) {
    const points = core_group.points();
    const objects = [];
    for (let point of points) {
      const id = params.use_id_attrib ? point.attrib_value(ATTRIBUTE_NAME.id) : params.class_name;
      const class_name = params.use_class_attrib ? point.attrib_value(ATTRIBUTE_NAME.class_name) : params.class_name;
      const html = params.use_html_attrib ? point.attrib_value(ATTRIBUTE_NAME.html) : params.html;
      const object = Css2DObjectSopOperation2.create_css_object({
        id,
        class_name,
        html
      });
      const element = object.element;
      if (params.copy_attributes) {
        const attrib_names = CoreString.attrib_names(params.attributes_to_copy);
        for (let attrib_name of attrib_names) {
          const attrib_value = point.attrib_value(attrib_name);
          if (lodash_isString(attrib_value)) {
            element.setAttribute(attrib_name, attrib_value);
          } else {
            if (lodash_isNumber(attrib_value)) {
              element.setAttribute(attrib_name, `${attrib_value}`);
            }
          }
        }
      }
      object.position.copy(point.position());
      object.updateMatrix();
      objects.push(object);
    }
    return objects;
  }
  _create_object_from_scratch(params) {
    const object = Css2DObjectSopOperation2.create_css_object({
      id: params.id,
      class_name: params.class_name,
      html: params.html
    });
    return object;
  }
  static create_css_object(params) {
    const element = document.createElement("div");
    element.id = params.id;
    element.className = params.class_name;
    element.innerHTML = params.html;
    const object = new CSS2DObject2(element);
    object.matrixAutoUpdate = false;
    return object;
  }
};
export let Css2DObjectSopOperation = Css2DObjectSopOperation2;
Css2DObjectSopOperation.DEFAULT_PARAMS = {
  use_id_attrib: false,
  id: "my_css_object",
  use_class_attrib: false,
  class_name: "css2d_object",
  use_html_attrib: false,
  html: "<div>default html</div>",
  copy_attributes: false,
  attributes_to_copy: ""
};
Css2DObjectSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
