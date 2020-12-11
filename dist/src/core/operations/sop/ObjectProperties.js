import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class ObjectPropertiesSopOperation extends BaseSopOperation {
  static type() {
    return "object_properties";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    for (let object of core_group.objects()) {
      if (params.apply_to_children) {
        object.traverse((child) => {
          this._update_object(child, params);
        });
      } else {
        this._update_object(object, params);
      }
    }
    return core_group;
  }
  _update_object(object, params) {
    if (params.tname) {
      object.name = params.name;
    }
    if (params.trender_order) {
      object.renderOrder = params.render_order;
    }
    object.frustumCulled = params.frustrum_culled;
    object.matrixAutoUpdate = params.matrix_auto_update;
    object.visible = params.visible;
    object.castShadow = params.cast_shadow;
    object.receiveShadow = params.receive_shadow;
  }
}
ObjectPropertiesSopOperation.DEFAULT_PARAMS = {
  apply_to_children: false,
  tname: false,
  name: "",
  trender_order: false,
  render_order: 0,
  frustrum_culled: true,
  matrix_auto_update: false,
  visible: true,
  cast_shadow: true,
  receive_shadow: true
};
ObjectPropertiesSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
