import lodash_isNumber from "lodash/isNumber";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {Operation} from "./TimelineBuilder";
import {ParamType as ParamType2} from "../../engine/poly/ParamType";
import {TypeAssert} from "../../engine/poly/Assert";
import {AnimNodeEasing} from "./Constant";
import {Poly as Poly2} from "../../engine/Poly";
const PROPERTY_SEPARATOR = ".";
export class TimelineBuilderProperty {
  constructor() {
  }
  set_name(name) {
    this._property_name = name;
  }
  set_target_value(value) {
    this._target_value = value;
  }
  name() {
    return this._property_name;
  }
  target_value() {
    return this._target_value;
  }
  clone() {
    const cloned = new TimelineBuilderProperty();
    if (this._property_name) {
      cloned.set_name(this._property_name);
    }
    if (this._target_value != null) {
      const new_target_value = lodash_isNumber(this._target_value) ? this._target_value : this._target_value.clone();
      cloned.set_target_value(new_target_value);
    }
    return cloned;
  }
  add_to_timeline(timeline_builder, scene, timeline, target) {
    const objects = target.objects(scene);
    if (objects) {
      this._populate_with_objects(objects, timeline_builder, timeline);
    } else {
      const node = target.node(scene);
      if (node) {
        this._populate_with_node(node, timeline_builder, timeline);
      }
    }
  }
  _populate_with_objects(objects, timeline_builder, timeline) {
    if (!this._property_name) {
      Poly2.warn("no property name given");
      return;
    }
    if (this._target_value == null) {
      Poly2.warn("no target value given");
      return;
    }
    const operation = timeline_builder.operation();
    const update_callback = timeline_builder.update_callback();
    for (let object3d of objects) {
      const props = this._scene_graph_props(object3d, this._property_name);
      if (props) {
        const target_property = props.target_property;
        const to_target = props.to_target;
        const property_names = props.property_names;
        const vars = this._common_vars(timeline_builder);
        if (update_callback && update_callback.update_matrix()) {
          const old_matrix_auto_update = object3d.matrixAutoUpdate;
          vars.onStart = () => {
            object3d.matrixAutoUpdate = true;
          };
          vars.onComplete = () => {
            object3d.matrixAutoUpdate = old_matrix_auto_update;
          };
        }
        if (lodash_isNumber(this._target_value)) {
          if (lodash_isNumber(target_property)) {
            for (let property_name of property_names) {
              vars[property_name] = this.with_op(target_property, this._target_value, operation);
            }
          }
        } else {
          if (!lodash_isNumber(target_property)) {
            for (let property_name of property_names) {
              vars[property_name] = this.with_op(target_property[property_name], this._target_value[property_name], operation);
            }
          }
        }
        if (to_target) {
          this._start_timeline(timeline_builder, timeline, vars, to_target);
        }
      }
    }
  }
  _scene_graph_props(object, property_name) {
    const elements = property_name.split(PROPERTY_SEPARATOR);
    if (elements.length > 1) {
      const first_element = elements.shift();
      const sub_object = object[first_element];
      if (sub_object) {
        const sub_property_name = elements.join(PROPERTY_SEPARATOR);
        return this._scene_graph_props(sub_object, sub_property_name);
      }
    } else {
      const target_property = object[property_name];
      let to_target = null;
      const property_names = [];
      if (lodash_isNumber(target_property)) {
        to_target = object;
        property_names.push(property_name);
      } else {
        to_target = target_property;
        if (this._target_value instanceof Vector22) {
          property_names.push("x", "y");
        }
        if (this._target_value instanceof Vector32) {
          property_names.push("x", "y", "z");
        }
        if (this._target_value instanceof Vector42) {
          property_names.push("x", "y", "z", "w");
        }
      }
      return {
        target_property,
        to_target,
        property_names
      };
    }
  }
  _populate_with_node(node, timeline_builder, timeline) {
    const target_param = node.p[this._property_name];
    if (!target_param) {
      Poly2.warn(`${this._property_name} not found on node ${node.full_path()}`);
      return;
    }
    if (target_param) {
      this._populate_vars_for_param(target_param, timeline_builder, timeline);
    }
  }
  _populate_vars_for_param(param, timeline_builder, timeline) {
    switch (param.type) {
      case ParamType2.FLOAT: {
        this._populate_vars_for_param_float(param, timeline_builder, timeline);
      }
      case ParamType2.VECTOR2: {
        this._populate_vars_for_param_vector2(param, timeline_builder, timeline);
      }
      case ParamType2.VECTOR3: {
        this._populate_vars_for_param_vector3(param, timeline_builder, timeline);
      }
      case ParamType2.VECTOR4: {
        this._populate_vars_for_param_vector4(param, timeline_builder, timeline);
      }
    }
  }
  _populate_vars_for_param_float(param, timeline_builder, timeline) {
    if (!lodash_isNumber(this._target_value)) {
      Poly2.warn("value is not a numbber", this._target_value);
      return;
    }
    const vars = this._common_vars(timeline_builder);
    const proxy = {num: param.value};
    vars.onUpdate = () => {
      param.set(proxy.num);
    };
    const operation = timeline_builder.operation();
    vars.num = this.with_op(param.value, this._target_value, operation);
    this._start_timeline(timeline_builder, timeline, vars, proxy);
  }
  _populate_vars_for_param_vector2(param, timeline_builder, timeline) {
    if (!(this._target_value instanceof Vector22)) {
      return;
    }
    const vars = this._common_vars(timeline_builder);
    const proxy = param.value.clone();
    const proxy_array = [0, 0];
    vars.onUpdate = () => {
      proxy.toArray(proxy_array);
      param.set(proxy_array);
    };
    const operation = timeline_builder.operation();
    vars.x = this.with_op(param.value.x, this._target_value.x, operation);
    vars.y = this.with_op(param.value.y, this._target_value.y, operation);
    this._start_timeline(timeline_builder, timeline, vars, proxy);
  }
  _populate_vars_for_param_vector3(param, timeline_builder, timeline) {
    if (!(this._target_value instanceof Vector32)) {
      return;
    }
    const vars = this._common_vars(timeline_builder);
    const proxy = param.value.clone();
    const proxy_array = [0, 0, 0];
    vars.onUpdate = () => {
      proxy.toArray(proxy_array);
      param.set(proxy_array);
    };
    const operation = timeline_builder.operation();
    vars.x = this.with_op(param.value.x, this._target_value.x, operation);
    vars.y = this.with_op(param.value.y, this._target_value.y, operation);
    vars.z = this.with_op(param.value.z, this._target_value.z, operation);
    this._start_timeline(timeline_builder, timeline, vars, proxy);
  }
  _populate_vars_for_param_vector4(param, timeline_builder, timeline) {
    if (!(this._target_value instanceof Vector42)) {
      return;
    }
    const vars = this._common_vars(timeline_builder);
    const proxy = param.value.clone();
    const proxy_array = [0, 0, 0, 0];
    vars.onUpdate = () => {
      proxy.toArray(proxy_array);
      param.set(proxy_array);
    };
    const operation = timeline_builder.operation();
    vars.x = this.with_op(param.value.x, this._target_value.x, operation);
    vars.y = this.with_op(param.value.y, this._target_value.y, operation);
    vars.z = this.with_op(param.value.z, this._target_value.z, operation);
    vars.w = this.with_op(param.value.w, this._target_value.w, operation);
    this._start_timeline(timeline_builder, timeline, vars, proxy);
  }
  with_op(current_value, value, operation) {
    switch (operation) {
      case Operation.SET:
        return value;
      case Operation.ADD:
        return current_value + value;
      case Operation.SUBSTRACT:
        return current_value - value;
    }
    TypeAssert.unreachable(operation);
  }
  _common_vars(timeline_builder) {
    const duration = timeline_builder.duration();
    const vars = {duration};
    const easing = timeline_builder.easing() || AnimNodeEasing.NONE;
    if (easing) {
      vars.ease = easing;
    }
    const delay = timeline_builder.delay();
    if (delay != null) {
      vars.delay = delay;
    }
    const repeat_params = timeline_builder.repeat_params();
    if (repeat_params) {
      vars.repeat = repeat_params.count;
      vars.repeatDelay = repeat_params.delay;
      vars.yoyo = repeat_params.yoyo;
    }
    return vars;
  }
  _start_timeline(timeline_builder, timeline, vars, target) {
    const position = timeline_builder.position();
    const position_param = position ? position.to_parameter() : void 0;
    timeline.to(target, vars, position_param);
  }
}
