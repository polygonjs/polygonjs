import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypedEventNode} from "./_Base";
import {TypeAssert} from "../../poly/Assert";
import {ParamType as ParamType2} from "../../poly/ParamType";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {Vector2 as Vector23} from "three/src/math/Vector2";
import {Vector3 as Vector33} from "three/src/math/Vector3";
import {Vector4 as Vector43} from "three/src/math/Vector4";
var SetParamParamType;
(function(SetParamParamType2) {
  SetParamParamType2["BOOLEAN"] = "boolean";
  SetParamParamType2["BUTTON"] = "button";
  SetParamParamType2["NUMBER"] = "number";
  SetParamParamType2["VECTOR2"] = "vector2";
  SetParamParamType2["VECTOR3"] = "vector3";
  SetParamParamType2["VECTOR4"] = "vector4";
  SetParamParamType2["STRING"] = "string";
})(SetParamParamType || (SetParamParamType = {}));
const SET_PARAM_PARAM_TYPE = [
  SetParamParamType.BOOLEAN,
  SetParamParamType.BUTTON,
  SetParamParamType.NUMBER,
  SetParamParamType.VECTOR2,
  SetParamParamType.VECTOR3,
  SetParamParamType.VECTOR4,
  SetParamParamType.STRING
];
const TYPE_BOOLEAN = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.BOOLEAN);
const TYPE_NUMBER = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.NUMBER);
const TYPE_VECTOR2 = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.VECTOR2);
const TYPE_VECTOR3 = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.VECTOR3);
const TYPE_VECTOR4 = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.VECTOR4);
const TYPE_STRING = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.STRING);
const OUTPUT_NAME = "output";
class SetParamParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.param = ParamConfig.OPERATOR_PATH("/geo1/display", {
      param_selection: true,
      compute_on_dirty: true
    });
    this.type = ParamConfig.INTEGER(TYPE_NUMBER, {
      menu: {
        entries: SET_PARAM_PARAM_TYPE.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.toggle = ParamConfig.BOOLEAN(0, {
      visible_if: {type: TYPE_BOOLEAN}
    });
    this.boolean = ParamConfig.BOOLEAN(0, {
      visible_if: {
        type: TYPE_BOOLEAN,
        toggle: 0
      }
    });
    this.number = ParamConfig.FLOAT(0, {
      visible_if: {type: TYPE_NUMBER}
    });
    this.vector2 = ParamConfig.VECTOR2([0, 0], {
      visible_if: {type: TYPE_VECTOR2}
    });
    this.vector3 = ParamConfig.VECTOR3([0, 0, 0], {
      visible_if: {type: TYPE_VECTOR3}
    });
    this.vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
      visible_if: {type: TYPE_VECTOR4}
    });
    this.increment = ParamConfig.BOOLEAN(0, {
      visible_if: [{type: TYPE_NUMBER}, {type: TYPE_VECTOR2}, {type: TYPE_VECTOR3}, {type: TYPE_VECTOR4}]
    });
    this.string = ParamConfig.STRING("", {
      visible_if: {type: TYPE_STRING}
    });
    this.execute = ParamConfig.BUTTON(null, {
      callback: (node) => {
        SetParamEventNode.PARAM_CALLBACK_execute(node);
      }
    });
  }
}
const ParamsConfig2 = new SetParamParamsConfig();
export class SetParamEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._tmp_vector2 = new Vector23();
    this._tmp_vector3 = new Vector33();
    this._tmp_vector4 = new Vector43();
    this._tmp_array2 = [0, 0];
    this._tmp_array3 = [0, 0, 0];
    this._tmp_array4 = [0, 0, 0, 0];
  }
  static type() {
    return "set_param";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint("trigger", EventConnectionPointType.BASE)
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE)
    ]);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.param]);
      });
    });
  }
  async process_event(event_context) {
    if (this.p.param.is_dirty) {
      await this.p.param.compute();
    }
    const param = this.p.param.found_param();
    if (param) {
      const new_value = await this._new_param_value(param);
      if (new_value != null) {
        param.set(new_value);
      }
    } else {
      this.states.error.set("target param not found");
    }
    this.dispatch_event_to_output(OUTPUT_NAME, event_context);
  }
  async _new_param_value(param) {
    const type = SET_PARAM_PARAM_TYPE[this.pv.type];
    switch (type) {
      case SetParamParamType.BOOLEAN: {
        await this._compute_params_if_dirty([this.p.toggle]);
        if (this.pv.toggle) {
          return param.value ? 0 : 1;
        } else {
          return this.pv.boolean ? 1 : 0;
        }
      }
      case SetParamParamType.BUTTON: {
        return param.options.execute_callback();
      }
      case SetParamParamType.NUMBER: {
        await this._compute_params_if_dirty([this.p.increment, this.p.number]);
        if (this.pv.increment) {
          if (param.type == ParamType2.FLOAT) {
            return param.value + this.pv.number;
          } else {
            return param.value;
          }
        } else {
          return this.pv.number;
        }
      }
      case SetParamParamType.VECTOR2: {
        await this._compute_params_if_dirty([this.p.increment, this.p.vector2]);
        if (this.pv.increment) {
          if (param.type == ParamType2.VECTOR2) {
            this._tmp_vector2.copy(param.value);
            this._tmp_vector2.add(this.pv.vector2);
            this._tmp_vector2.toArray(this._tmp_array2);
          } else {
            param.value.toArray(this._tmp_array2);
          }
        } else {
          this.pv.vector2.toArray(this._tmp_array2);
        }
        return this._tmp_array2;
      }
      case SetParamParamType.VECTOR3: {
        await this._compute_params_if_dirty([this.p.increment, this.p.vector3]);
        if (this.pv.increment) {
          if (param.type == ParamType2.VECTOR3) {
            this._tmp_vector3.copy(param.value);
            this._tmp_vector3.add(this.pv.vector3);
            this._tmp_vector3.toArray(this._tmp_array3);
          } else {
            param.value.toArray(this._tmp_array3);
          }
        } else {
          this.pv.vector3.toArray(this._tmp_array3);
        }
        return this._tmp_array3;
      }
      case SetParamParamType.VECTOR4: {
        await this._compute_params_if_dirty([this.p.increment, this.p.vector4]);
        if (this.pv.increment) {
          if (param.type == ParamType2.VECTOR4) {
            this._tmp_vector4.copy(param.value);
            this._tmp_vector4.add(this.pv.vector4);
            this._tmp_vector4.toArray(this._tmp_array4);
          } else {
            param.value.toArray(this._tmp_array4);
          }
        } else {
          this.pv.vector4.toArray(this._tmp_array4);
        }
        return this._tmp_array4;
      }
      case SetParamParamType.STRING: {
        await this._compute_params_if_dirty([this.p.string]);
        return this.pv.string;
      }
    }
    TypeAssert.unreachable(type);
  }
  static PARAM_CALLBACK_execute(node) {
    node.process_event({});
  }
  async _compute_params_if_dirty(params) {
    const dirty_params = [];
    for (let param of params) {
      if (param.is_dirty) {
        dirty_params.push(param);
      }
    }
    const promises = [];
    for (let param of dirty_params) {
      promises.push(param.compute());
    }
    return await Promise.all(promises);
  }
}
