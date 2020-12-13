import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import lodash_isNumber from "lodash/isNumber";
import {TypedSopNode} from "./_Base";
import {CoreMath} from "../../../core/math/_Module";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {TypeAssert} from "../../poly/Assert";
import {SimplexNoise as SimplexNoise2} from "../../../modules/three/examples/jsm/math/SimplexNoise";
var Operation;
(function(Operation2) {
  Operation2["ADD"] = "add";
  Operation2["SET"] = "set";
  Operation2["MULT"] = "mult";
  Operation2["SUBSTRACT"] = "substract";
  Operation2["DIVIDE"] = "divide";
})(Operation || (Operation = {}));
const Operations = [Operation.ADD, Operation.SET, Operation.MULT, Operation.SUBSTRACT, Operation.DIVIDE];
const ATTRIB_NORMAL = "normal";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class NoiseSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.amount = ParamConfig.FLOAT(1);
    this.freq = ParamConfig.VECTOR3([1, 1, 1]);
    this.offset = ParamConfig.VECTOR3([0, 0, 0]);
    this.octaves = ParamConfig.INTEGER(3, {
      range: [1, 8],
      range_locked: [true, false]
    });
    this.amp_attenuation = ParamConfig.FLOAT(0.5, {range: [0, 1]});
    this.freq_increase = ParamConfig.FLOAT(2, {range: [0, 10]});
    this.seed = ParamConfig.INTEGER(0, {range: [0, 100]});
    this.separator = ParamConfig.SEPARATOR();
    this.use_normals = ParamConfig.BOOLEAN(0);
    this.attrib_name = ParamConfig.STRING("position");
    this.operation = ParamConfig.INTEGER(Operations.indexOf(Operation.ADD), {
      menu: {
        entries: Operations.map((operation) => {
          return {
            name: operation,
            value: Operations.indexOf(operation)
          };
        })
      }
    });
    this.compute_normals = ParamConfig.BOOLEAN(1);
  }
}
const ParamsConfig2 = new NoiseSopParamsConfig();
export class NoiseSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._simplex_by_seed = new Map();
    this._rest_points = [];
    this._rest_pos = new Vector32();
    this._rest_value2 = new Vector22();
    this._noise_value_v = new Vector32();
  }
  static type() {
    return "noise";
  }
  static displayed_input_names() {
    return ["geometry to add noise to", "rest geometry"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE, InputCloneMode2.NEVER]);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    const core_group_rest = input_contents[1];
    const dest_points = core_group.points();
    if (core_group_rest) {
      if (this._rest_core_group_timestamp == null || this._rest_core_group_timestamp != core_group_rest.timestamp()) {
        this._rest_points = core_group_rest.points();
        this._rest_core_group_timestamp = core_group_rest.timestamp();
      }
    }
    const simplex = this._get_simplex();
    const use_normals = this.pv.use_normals && core_group.has_attrib(ATTRIB_NORMAL);
    const target_attrib_size = core_group.attrib_size(this.pv.attrib_name);
    for (let i = 0; i < dest_points.length; i++) {
      const dest_point = dest_points[i];
      let rest_point = core_group_rest ? this._rest_points[i] : dest_point;
      const current_attrib_value = rest_point.attrib_value(this.pv.attrib_name);
      const noise_result = this._noise_value(use_normals, simplex, rest_point);
      const noise_value = this._make_noise_value_correct_size(noise_result, target_attrib_size);
      const operation = Operations[this.pv.operation];
      if (lodash_isNumber(current_attrib_value) && lodash_isNumber(noise_value)) {
        const new_attrib_value_f = this._new_attrib_value_from_float(operation, current_attrib_value, noise_value);
        dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_f);
      } else {
        if (current_attrib_value instanceof Vector22 && noise_value instanceof Vector22) {
          const new_attrib_value_v = this._new_attrib_value_from_vector2(operation, current_attrib_value, noise_value);
          dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_v);
        } else {
          if (current_attrib_value instanceof Vector32 && noise_value instanceof Vector32) {
            const new_attrib_value_v = this._new_attrib_value_from_vector3(operation, current_attrib_value, noise_value);
            dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_v);
          } else {
            if (current_attrib_value instanceof Vector42 && noise_value instanceof Vector42) {
              const new_attrib_value_v = this._new_attrib_value_from_vector4(operation, current_attrib_value, noise_value);
              dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_v);
            }
          }
        }
      }
    }
    if (!this.io.inputs.clone_required(0)) {
      for (let geometry of core_group.geometries()) {
        geometry.getAttribute(this.pv.attrib_name).needsUpdate = true;
      }
    }
    if (this.pv.compute_normals) {
      core_group.compute_vertex_normals();
    }
    this.set_core_group(core_group);
  }
  _noise_value(use_normals, simplex, rest_point) {
    const pos = rest_point.position(this._rest_pos).add(this.pv.offset).multiply(this.pv.freq);
    if (use_normals) {
      const noise = this.pv.amount * this._fbm(simplex, pos.x, pos.y, pos.z);
      const normal = rest_point.attrib_value(ATTRIB_NORMAL);
      this._noise_value_v.copy(normal);
      return this._noise_value_v.multiplyScalar(noise);
    } else {
      this._noise_value_v.set(this.pv.amount * this._fbm(simplex, pos.x + 545, pos.y + 125454, pos.z + 2142), this.pv.amount * this._fbm(simplex, pos.x - 425, pos.y - 25746, pos.z + 95242), this.pv.amount * this._fbm(simplex, pos.x + 765132, pos.y + 21, pos.z - 9245));
      return this._noise_value_v;
    }
  }
  _make_noise_value_correct_size(noise_value, target_attrib_size) {
    switch (target_attrib_size) {
      case 1:
        return noise_value.x;
      case 2:
        this._rest_value2.set(noise_value.x, noise_value.y);
        return this._rest_value2;
      case 3:
        return noise_value;
      default:
        return noise_value;
    }
  }
  _new_attrib_value_from_float(operation, current_attrib_value, noise_value) {
    switch (operation) {
      case Operation.ADD:
        return current_attrib_value + noise_value;
      case Operation.SET:
        return noise_value;
      case Operation.MULT:
        return current_attrib_value * noise_value;
      case Operation.DIVIDE:
        return current_attrib_value / noise_value;
      case Operation.SUBSTRACT:
        return current_attrib_value - noise_value;
    }
    TypeAssert.unreachable(operation);
  }
  _new_attrib_value_from_vector2(operation, current_attrib_value, noise_value) {
    switch (operation) {
      case Operation.ADD:
        return current_attrib_value.add(noise_value);
      case Operation.SET:
        return noise_value;
      case Operation.MULT:
        return current_attrib_value.multiply(noise_value);
      case Operation.DIVIDE:
        return current_attrib_value.divide(noise_value);
      case Operation.SUBSTRACT:
        return current_attrib_value.sub(noise_value);
    }
    TypeAssert.unreachable(operation);
  }
  _new_attrib_value_from_vector3(operation, current_attrib_value, noise_value) {
    switch (operation) {
      case Operation.ADD:
        return current_attrib_value.add(noise_value);
      case Operation.SET:
        return noise_value;
      case Operation.MULT:
        return current_attrib_value.multiply(noise_value);
      case Operation.DIVIDE:
        return current_attrib_value.divide(noise_value);
      case Operation.SUBSTRACT:
        return current_attrib_value.sub(noise_value);
    }
    TypeAssert.unreachable(operation);
  }
  _new_attrib_value_from_vector4(operation, current_attrib_value, noise_value) {
    switch (operation) {
      case Operation.ADD:
        return current_attrib_value.add(noise_value);
      case Operation.SET:
        return noise_value;
      case Operation.MULT:
        return current_attrib_value.multiplyScalar(noise_value.x);
      case Operation.DIVIDE:
        return current_attrib_value.divideScalar(noise_value.x);
      case Operation.SUBSTRACT:
        return current_attrib_value.sub(noise_value);
    }
    TypeAssert.unreachable(operation);
  }
  _fbm(simplex, x, y, z) {
    let value = 0;
    let amplitude = 1;
    for (let i = 0; i < this.pv.octaves; i++) {
      value += amplitude * simplex.noise3d(x, y, z);
      x *= this.pv.freq_increase;
      y *= this.pv.freq_increase;
      z *= this.pv.freq_increase;
      amplitude *= this.pv.amp_attenuation;
    }
    return value;
  }
  _get_simplex() {
    const simplex = this._simplex_by_seed.get(this.pv.seed);
    if (simplex) {
      return simplex;
    } else {
      const simplex2 = this._create_simplex();
      this._simplex_by_seed.set(this.pv.seed, simplex2);
      return simplex2;
    }
  }
  _create_simplex() {
    const seed = this.pv.seed;
    const random_generator = {
      random: function() {
        return CoreMath.rand_float(seed);
      }
    };
    const simplex = new SimplexNoise2(random_generator);
    this._simplex_by_seed.delete(seed);
    return simplex;
  }
}
