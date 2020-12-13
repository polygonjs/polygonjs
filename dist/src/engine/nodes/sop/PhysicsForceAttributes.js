import {TypedSopNode} from "./_Base";
import lodash_isArray from "lodash/isArray";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {
  DirectionalForceAttribute,
  RadialForceAttribute,
  ForceType,
  FORCE_DEFAULT_ATTRIBUTE_VALUES,
  FORCE_TYPES,
  FORCE_TYPE_ATTRIBUTE_NAME
} from "../../../core/physics/ammo/ForceHelper";
function visible_for_type(type, options = {}) {
  options["type"] = FORCE_TYPES.indexOf(type);
  return {visible_if: options};
}
function visible_for_directional(options = {}) {
  return visible_for_type(ForceType.DIRECTIONAL, options);
}
function visible_for_radial(options = {}) {
  return visible_for_type(ForceType.RADIAL, options);
}
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypeAssert} from "../../poly/Assert";
class PhysicsForceAttributesSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.type = ParamConfig.INTEGER(FORCE_TYPES.indexOf(ForceType.DIRECTIONAL), {
      menu: {
        entries: FORCE_TYPES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.direction = ParamConfig.VECTOR3([0, -9.81, 0], {...visible_for_directional()});
    this.amount = ParamConfig.FLOAT(1, {...visible_for_radial()});
    this.max_distance = ParamConfig.FLOAT(10, {...visible_for_radial()});
    this.max_speed = ParamConfig.FLOAT(10, {...visible_for_radial()});
  }
}
const ParamsConfig2 = new PhysicsForceAttributesSopParamsConfig();
export class PhysicsForceAttributesSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "physics_force_attributes";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    const force_type = FORCE_TYPES[this.pv.type];
    this._create_attributes_if_required(core_group, force_type);
    const points = core_group.points();
    for (let point of points) {
      point.set_attrib_value(FORCE_TYPE_ATTRIBUTE_NAME, this.pv.type);
    }
    this._apply_force_attributes(points, force_type);
    this.set_core_group(input_contents[0]);
  }
  _apply_force_attributes(points, force_type) {
    switch (force_type) {
      case ForceType.DIRECTIONAL: {
        return this._apply_attributes_directional(points);
      }
      case ForceType.RADIAL: {
        return this._apply_attributes_radial(points);
      }
    }
    TypeAssert.unreachable(force_type);
  }
  _apply_attributes_directional(points) {
    for (let point of points) {
      point.set_attrib_value(DirectionalForceAttribute.DIRECTION, this.pv.direction);
    }
  }
  _apply_attributes_radial(points) {
    for (let point of points) {
      point.set_attrib_value(RadialForceAttribute.CENTER, point.position());
      point.set_attrib_value(RadialForceAttribute.AMOUNT, this.pv.amount);
      point.set_attrib_value(RadialForceAttribute.MAX_DISTANCE, this.pv.max_distance);
      point.set_attrib_value(RadialForceAttribute.MAX_SPEED, this.pv.max_speed);
    }
  }
  _create_attributes_if_required(core_group, force_type) {
    const core_geometries = core_group.core_geometries();
    const default_values = FORCE_DEFAULT_ATTRIBUTE_VALUES[force_type];
    const attributes = Object.keys(default_values);
    attributes.push(FORCE_TYPE_ATTRIBUTE_NAME);
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      const default_value = default_values[attribute];
      for (let core_geometry of core_geometries) {
        if (!core_geometry.has_attrib(attribute)) {
          let size = 1;
          if (lodash_isArray(default_value)) {
            size = default_value.length;
          }
          core_geometry.add_numeric_attrib(attribute, size, default_value);
        }
      }
    }
  }
}
