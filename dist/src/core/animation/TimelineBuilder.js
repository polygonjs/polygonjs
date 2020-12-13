import {TimelineBuilderProperty as TimelineBuilderProperty2} from "./TimelineBuilderProperty";
import gsap2 from "gsap";
export var Operation;
(function(Operation2) {
  Operation2["SET"] = "set";
  Operation2["ADD"] = "add";
  Operation2["SUBSTRACT"] = "substract";
})(Operation || (Operation = {}));
export const OPERATIONS = [Operation.SET, Operation.ADD, Operation.SUBSTRACT];
export class TimelineBuilder {
  constructor() {
    this._timeline_builders = [];
    this._duration = 1;
    this._operation = Operation.SET;
    this._delay = 0;
  }
  add_timeline_builder(timeline_builder) {
    this._timeline_builders.push(timeline_builder);
    timeline_builder.set_parent(this);
  }
  timeline_builders() {
    return this._timeline_builders;
  }
  set_parent(parent) {
    this._parent = parent;
  }
  parent() {
    return this._parent;
  }
  set_target(target) {
    this._target = target;
    for (let builder of this._timeline_builders) {
      builder.set_target(target);
    }
  }
  target() {
    return this._target;
  }
  set_duration(duration) {
    if (duration >= 0) {
      this._duration = duration;
      for (let builder of this._timeline_builders) {
        builder.set_duration(duration);
      }
    }
  }
  duration() {
    return this._duration;
  }
  set_easing(easing) {
    this._easing = easing;
    for (let builder of this._timeline_builders) {
      builder.set_easing(easing);
    }
  }
  easing() {
    return this._easing;
  }
  set_operation(operation) {
    this._operation = operation;
    for (let builder of this._timeline_builders) {
      builder.set_operation(operation);
    }
  }
  operation() {
    return this._operation;
  }
  set_repeat_params(repeat_params) {
    this._repeat_params = repeat_params;
    for (let builder of this._timeline_builders) {
      builder.set_repeat_params(repeat_params);
    }
  }
  repeat_params() {
    return this._repeat_params;
  }
  set_delay(delay) {
    this._delay = delay;
    for (let builder of this._timeline_builders) {
      builder.set_delay(delay);
    }
  }
  delay() {
    return this._delay;
  }
  set_position(position) {
    this._position = position;
  }
  position() {
    return this._position;
  }
  set_update_callback(update_callback) {
    this._update_callback = update_callback;
  }
  update_callback() {
    return this._update_callback;
  }
  clone() {
    const new_timeline_builder = new TimelineBuilder();
    new_timeline_builder.set_duration(this._duration);
    new_timeline_builder.set_operation(this._operation);
    new_timeline_builder.set_delay(this._delay);
    if (this._target) {
      new_timeline_builder.set_target(this._target.clone());
    }
    if (this._easing) {
      new_timeline_builder.set_easing(this._easing);
    }
    if (this._delay) {
      new_timeline_builder.set_delay(this._delay);
    }
    if (this._update_callback) {
      new_timeline_builder.set_update_callback(this._update_callback.clone());
    }
    if (this._repeat_params) {
      new_timeline_builder.set_repeat_params({
        count: this._repeat_params.count,
        delay: this._repeat_params.delay,
        yoyo: this._repeat_params.yoyo
      });
    }
    if (this._property) {
      const name = this._property.name();
      if (name) {
        new_timeline_builder.set_property_name(name);
      }
      const target_value = this._property.target_value();
      if (target_value != null) {
        new_timeline_builder.set_property_value(target_value);
      }
    }
    if (this._position) {
      new_timeline_builder.set_position(this._position.clone());
    }
    for (let child_timeline_builder of this._timeline_builders) {
      const new_child_timeline_builder = child_timeline_builder.clone();
      new_timeline_builder.add_timeline_builder(new_child_timeline_builder);
    }
    return new_timeline_builder;
  }
  set_property_name(name) {
    this._property = this._property || new TimelineBuilderProperty2();
    this._property.set_name(name);
  }
  set_property_value(value) {
    this._property = this._property || new TimelineBuilderProperty2();
    this._property.set_target_value(value);
  }
  populate(timeline, scene) {
    for (let timeline_builder of this._timeline_builders) {
      const sub_timeline = gsap2.timeline();
      timeline_builder.populate(sub_timeline, scene);
      const position_param = timeline_builder.position()?.to_parameter() || void 0;
      timeline.add(sub_timeline, position_param);
    }
    if (this._property && this._target) {
      this._property.add_to_timeline(this, scene, timeline, this._target);
    }
  }
}
