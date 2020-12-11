import {TypedSopNode} from "./_Base";
import {JsonDataLoader} from "../../../core/loader/geometry/JsonData";
const DEFAULT_DATA = [
  {value: -40},
  {value: -30},
  {value: -20},
  {value: -10},
  {value: 0},
  {value: 10},
  {value: 20},
  {value: 30},
  {value: 40},
  {value: 50},
  {value: 60},
  {value: 70},
  {value: 80}
];
const DEFAULT_DATA_STR = JSON.stringify(DEFAULT_DATA);
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ObjectType} from "../../../core/geometry/Constant";
class DataSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.data = ParamConfig.STRING(DEFAULT_DATA_STR);
  }
}
const ParamsConfig2 = new DataSopParamsConfig();
export class DataSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "data";
  }
  cook() {
    let json = null;
    try {
      json = JSON.parse(this.pv.data);
    } catch (e) {
      this.states.error.set("could not parse json");
    }
    if (json) {
      try {
        const loader = new JsonDataLoader();
        loader.set_json(json);
        const geometry = loader.create_object();
        this.set_geometry(geometry, ObjectType.POINTS);
      } catch (e) {
        this.states.error.set("could not build geometry from json");
      }
    } else {
      this.cook_controller.end_cook();
    }
  }
}
