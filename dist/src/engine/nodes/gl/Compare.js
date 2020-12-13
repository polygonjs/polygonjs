import lodash_times from "lodash/times";
import lodash_padEnd from "lodash/padEnd";
import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPointComponentsCountMap} from "../utils/io/connections/Gl";
export var GlCompareTestName;
(function(GlCompareTestName2) {
  GlCompareTestName2["EQUAL"] = "Equal";
  GlCompareTestName2["LESS_THAN"] = "Less Than";
  GlCompareTestName2["GREATER_THAN"] = "Greater Than";
  GlCompareTestName2["LESS_THAN_OR_EQUAL"] = "Less Than Or Equal";
  GlCompareTestName2["GREATER_THAN_OR_EQUAL"] = "Greater Than Or Equal";
  GlCompareTestName2["NOT_EQUAL"] = "Not Equal";
})(GlCompareTestName || (GlCompareTestName = {}));
var TestOperation;
(function(TestOperation2) {
  TestOperation2["EQUAL"] = "==";
  TestOperation2["LESS_THAN"] = "<";
  TestOperation2["GREATER_THAN"] = ">";
  TestOperation2["LESS_THAN_OR_EQUAL"] = "<=";
  TestOperation2["GREATER_THAN_OR_EQUAL"] = ">=";
  TestOperation2["NOT_EQUAL"] = "!=";
})(TestOperation || (TestOperation = {}));
const TEST_NAMES = [
  GlCompareTestName.EQUAL,
  GlCompareTestName.LESS_THAN,
  GlCompareTestName.GREATER_THAN,
  GlCompareTestName.LESS_THAN_OR_EQUAL,
  GlCompareTestName.GREATER_THAN_OR_EQUAL,
  GlCompareTestName.NOT_EQUAL
];
const TEST_OPERATIONS_FLOAT = [
  TestOperation.EQUAL,
  TestOperation.LESS_THAN,
  TestOperation.GREATER_THAN,
  TestOperation.LESS_THAN_OR_EQUAL,
  TestOperation.GREATER_THAN_OR_EQUAL,
  TestOperation.NOT_EQUAL
];
const AND_SEPARATOR = " && ";
const COMPONENTS = ["x", "y", "z", "w"];
const OUTPUT_NAME = "val";
class CompareGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.test = ParamConfig.INTEGER(0, {
      menu: {
        entries: TEST_NAMES.map((name, i) => {
          const operator = TEST_OPERATIONS_FLOAT[i];
          const label = `${lodash_padEnd(operator, 2, " ")} (${name})`;
          return {name: label, value: i};
        })
      }
    });
  }
}
const ParamsConfig2 = new CompareGlParamsConfig();
export class CompareGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "compare";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.spare_params.set_inputless_param_names(["test"]);
    this.io.connection_points.initialize_node();
    this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
    this.io.connection_points.set_output_name_function((index) => OUTPUT_NAME);
    this.io.connection_points.set_expected_input_types_function(this._expected_input_type.bind(this));
    this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.BOOL]);
  }
  set_test_name(test) {
    this.p.test.set(TEST_NAMES.indexOf(test));
  }
  _gl_input_name(index) {
    return ["value0", "value1"][index];
  }
  _expected_input_type() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    return [type, type];
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const value = this.gl_var_name(OUTPUT_NAME);
    const operator = TEST_OPERATIONS_FLOAT[this.pv.test];
    const value0 = ThreeToGl2.any(this.variable_for_input(this._gl_input_name(0)));
    const value1 = ThreeToGl2.any(this.variable_for_input(this._gl_input_name(1)));
    const first_connection = this.io.inputs.named_input_connection_points[0];
    let components_count = 1;
    if (first_connection) {
      components_count = GlConnectionPointComponentsCountMap[first_connection.type] || 1;
    }
    if (components_count > 1) {
      let tmp_values = [];
      lodash_times(components_count, (i) => {
        const tmp_value = this.gl_var_name(`tmp_value_${i}`);
        const component = COMPONENTS[i];
        tmp_values.push(tmp_value);
        body_lines.push(`bool ${tmp_value} = (${value0}.${component} ${operator} ${value1}.${component})`);
      });
      body_lines.push(`bool ${value} = (${tmp_values.join(AND_SEPARATOR)})`);
    } else {
      body_lines.push(`bool ${value} = (${value0} ${operator} ${value1})`);
    }
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
}
