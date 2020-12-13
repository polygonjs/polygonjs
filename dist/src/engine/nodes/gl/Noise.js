import lodash_range from "lodash/range";
import {TypedGlNode} from "./_Base";
import {
  GlConnectionPoint,
  GlConnectionPointComponentsCountMap,
  GlConnectionPointType
} from "../utils/io/connections/Gl";
import NoiseCommon from "./gl/noise/common.glsl";
import classicnoise2D2 from "./gl/noise/classicnoise2D.glsl";
import classicnoise3D2 from "./gl/noise/classicnoise3D.glsl";
import classicnoise4D2 from "./gl/noise/classicnoise4D.glsl";
import noise2D2 from "./gl/noise/noise2D.glsl";
import noise3D2 from "./gl/noise/noise3D.glsl";
import noise4D2 from "./gl/noise/noise4D.glsl";
export var NoiseName;
(function(NoiseName2) {
  NoiseName2["CLASSIC_PERLIN_2D"] = "Classic Perlin 2D";
  NoiseName2["CLASSIC_PERLIN_3D"] = "Classic Perlin 3D";
  NoiseName2["CLASSIC_PERLIN_4D"] = "Classic Perlin 4D";
  NoiseName2["NOISE_2D"] = "noise2D";
  NoiseName2["NOISE_3D"] = "noise3D";
  NoiseName2["NOISE_4D"] = "noise4D";
})(NoiseName || (NoiseName = {}));
export const NOISE_NAMES = [
  NoiseName.CLASSIC_PERLIN_2D,
  NoiseName.CLASSIC_PERLIN_3D,
  NoiseName.CLASSIC_PERLIN_4D,
  NoiseName.NOISE_2D,
  NoiseName.NOISE_3D,
  NoiseName.NOISE_4D
];
const IMPORT_BY_NOISE_NAME = {
  [NoiseName.CLASSIC_PERLIN_2D]: classicnoise2D2,
  [NoiseName.CLASSIC_PERLIN_3D]: classicnoise3D2,
  [NoiseName.CLASSIC_PERLIN_4D]: classicnoise4D2,
  [NoiseName.NOISE_2D]: noise2D2,
  [NoiseName.NOISE_3D]: noise3D2,
  [NoiseName.NOISE_4D]: noise4D2
};
const INPUT_TYPES_BY_NOISE_NAME = {
  [NoiseName.CLASSIC_PERLIN_2D]: GlConnectionPointType.VEC2,
  [NoiseName.CLASSIC_PERLIN_3D]: GlConnectionPointType.VEC3,
  [NoiseName.CLASSIC_PERLIN_4D]: GlConnectionPointType.VEC4,
  [NoiseName.NOISE_2D]: GlConnectionPointType.VEC2,
  [NoiseName.NOISE_3D]: GlConnectionPointType.VEC3,
  [NoiseName.NOISE_4D]: GlConnectionPointType.VEC4
};
const OUTPUT_TYPE_BY_NOISE_NAME = {
  [NoiseName.CLASSIC_PERLIN_2D]: GlConnectionPointType.FLOAT,
  [NoiseName.CLASSIC_PERLIN_3D]: GlConnectionPointType.FLOAT,
  [NoiseName.CLASSIC_PERLIN_4D]: GlConnectionPointType.FLOAT,
  [NoiseName.NOISE_2D]: GlConnectionPointType.FLOAT,
  [NoiseName.NOISE_3D]: GlConnectionPointType.FLOAT,
  [NoiseName.NOISE_4D]: GlConnectionPointType.FLOAT
};
const METHOD_NAMES_BY_NOISE_NAME = {
  [NoiseName.CLASSIC_PERLIN_2D]: "cnoise",
  [NoiseName.CLASSIC_PERLIN_3D]: "cnoise",
  [NoiseName.CLASSIC_PERLIN_4D]: "cnoise",
  [NoiseName.NOISE_2D]: "snoise",
  [NoiseName.NOISE_3D]: "snoise",
  [NoiseName.NOISE_4D]: "snoise"
};
var OUTPUT_TYPE;
(function(OUTPUT_TYPE2) {
  OUTPUT_TYPE2[OUTPUT_TYPE2["NoChange"] = 0] = "NoChange";
  OUTPUT_TYPE2[OUTPUT_TYPE2["Float"] = 1] = "Float";
  OUTPUT_TYPE2[OUTPUT_TYPE2["Vec2"] = 2] = "Vec2";
  OUTPUT_TYPE2[OUTPUT_TYPE2["Vec3"] = 3] = "Vec3";
  OUTPUT_TYPE2[OUTPUT_TYPE2["Vec4"] = 4] = "Vec4";
})(OUTPUT_TYPE || (OUTPUT_TYPE = {}));
const OUTPUT_TYPES = [
  0,
  1,
  2,
  3,
  4
];
const OUTPUT_TYPE_LABEL = {
  [0]: "Same as noise",
  [1]: "Float",
  [2]: "Vec2",
  [3]: "Vec3",
  [4]: "Vec4"
};
const CONNECTION_TYPE_BY_OUTPUT_TYPE = {
  [0]: GlConnectionPointType.FLOAT,
  [1]: GlConnectionPointType.FLOAT,
  [2]: GlConnectionPointType.VEC2,
  [3]: GlConnectionPointType.VEC3,
  [4]: GlConnectionPointType.VEC4
};
const ALL_COMPONENTS = ["x", "y", "z", "w"];
const OUTPUT_NAME = "noise";
const default_noise_type = NOISE_NAMES.indexOf(NoiseName.NOISE_3D);
const default_output_type = 0;
const DefaultValues = {
  amp: 1,
  freq: 1
};
var InputName;
(function(InputName2) {
  InputName2["AMP"] = "amp";
  InputName2["POSITION"] = "position";
  InputName2["FREQ"] = "freq";
  InputName2["OFFSET"] = "offset";
})(InputName || (InputName = {}));
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
class NoiseGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.type = ParamConfig.INTEGER(default_noise_type, {
      menu: {
        entries: NOISE_NAMES.map((noise_name, i) => {
          const noise_output_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name];
          const name = `${noise_name} (output: ${noise_output_type})`;
          return {name, value: i};
        })
      }
    });
    this.output_type = ParamConfig.INTEGER(default_output_type, {
      menu: {
        entries: OUTPUT_TYPES.map((output_type) => {
          const val = OUTPUT_TYPES[output_type];
          const name = OUTPUT_TYPE_LABEL[val];
          return {name, value: val};
        })
      }
    });
    this.octaves = ParamConfig.INTEGER(3, {range: [1, 10], range_locked: [true, false]});
    this.amp_attenuation = ParamConfig.FLOAT(0.5, {range: [0, 1]});
    this.freq_increase = ParamConfig.FLOAT(2, {range: [0, 10]});
    this.separator = ParamConfig.SEPARATOR();
  }
}
const ParamsConfig2 = new NoiseGlParamsConfig();
export class NoiseGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "noise";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.initialize_node();
    this.io.connection_points.spare_params.set_inputless_param_names([
      "octaves",
      "amp_attenuation",
      "freq_increase"
    ]);
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT)
    ]);
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
    this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
    this.io.connection_points.set_output_name_function(() => OUTPUT_NAME);
  }
  _gl_input_name(index) {
    return [InputName.AMP, InputName.POSITION, InputName.FREQ, InputName.OFFSET][index];
  }
  param_default_value(name) {
    return DefaultValues[name];
  }
  _expected_input_types() {
    const noise_name = NOISE_NAMES[this.pv.type];
    const amplitude_type = this._expected_output_types()[0];
    const type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
    return [amplitude_type, type, type, type];
  }
  _expected_output_types() {
    const noise_name = NOISE_NAMES[this.pv.type];
    const output_type = OUTPUT_TYPES[this.pv.output_type];
    if (output_type == 0) {
      return [INPUT_TYPES_BY_NOISE_NAME[noise_name]];
    } else {
      return [CONNECTION_TYPE_BY_OUTPUT_TYPE[output_type]];
    }
  }
  set_lines(shaders_collection_controller) {
    const function_declaration_lines = [];
    const body_lines = [];
    const noise_name = NOISE_NAMES[this.pv.type];
    const noise_function = IMPORT_BY_NOISE_NAME[noise_name];
    const noise_output_gl_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name];
    function_declaration_lines.push(new FunctionGLDefinition(this, NoiseCommon));
    function_declaration_lines.push(new FunctionGLDefinition(this, noise_function));
    function_declaration_lines.push(new FunctionGLDefinition(this, this.fbm_function()));
    const output_gl_type = this._expected_output_types()[0];
    if (output_gl_type == noise_output_gl_type) {
      const line = this.single_noise_line();
      body_lines.push(line);
    } else {
      const requested_components_count = GlConnectionPointComponentsCountMap[output_gl_type];
      const lines_count_required = requested_components_count;
      const assembly_args = [];
      const noise = this.gl_var_name("noise");
      for (let i = 0; i < lines_count_required; i++) {
        const component = ALL_COMPONENTS[i];
        assembly_args.push(`${noise}${component}`);
        const input_type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
        const offset_gl_type = input_type;
        const offset_components_count = GlConnectionPointComponentsCountMap[offset_gl_type];
        const offset_values = lodash_range(offset_components_count).map((j) => ThreeToGl2.float(1e3 * i)).join(", ");
        const offset2 = `${offset_gl_type}(${offset_values})`;
        const line = this.single_noise_line(component, component, offset2);
        body_lines.push(line);
      }
      const joined_args = assembly_args.join(", ");
      const assembly_line = `vec${lines_count_required} ${noise} = vec${lines_count_required}(${joined_args})`;
      body_lines.push(assembly_line);
    }
    shaders_collection_controller.add_definitions(this, function_declaration_lines);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
  fbm_method_name() {
    const noise_name = NOISE_NAMES[this.pv.type];
    const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name];
    return `fbm_${method_name}_${this.name}`;
  }
  fbm_function() {
    const noise_name = NOISE_NAMES[this.pv.type];
    const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name];
    const input_type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
    return `
float ${this.fbm_method_name()} (in ${input_type} st) {
	float value = 0.0;
	float amplitude = 1.0;
	for (int i = 0; i < ${ThreeToGl2.int(this.pv.octaves)}; i++) {
		value += amplitude * ${method_name}(st);
		st *= ${ThreeToGl2.float(this.pv.freq_increase)};
		amplitude *= ${ThreeToGl2.float(this.pv.amp_attenuation)};
	}
	return value;
}
`;
  }
  single_noise_line(output_name_suffix, component, offset2) {
    const method_name = this.fbm_method_name();
    const amp = ThreeToGl2.any(this.variable_for_input(InputName.AMP));
    const position = ThreeToGl2.any(this.variable_for_input(InputName.POSITION));
    const freq = ThreeToGl2.any(this.variable_for_input(InputName.FREQ));
    let offset = ThreeToGl2.any(this.variable_for_input(InputName.OFFSET));
    if (offset2) {
      offset = `(${offset}+${offset2})`;
    }
    const args = [`(${position}*${freq})+${offset}`];
    const joined_args = args.join(", ");
    const noise = this.gl_var_name(OUTPUT_NAME);
    const right_hand = `${amp}*${method_name}(${joined_args})`;
    if (component) {
      return `float ${noise}${output_name_suffix} = (${right_hand}).${component}`;
    } else {
      const output_type = this.io.outputs.named_output_connection_points[0].type;
      return `${output_type} ${noise} = ${right_hand}`;
    }
  }
}
