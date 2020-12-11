import {BaseSopOperation} from "./_Base";
import {Color as Color2} from "three/src/math/Color";
export class ColorSopOperation extends BaseSopOperation {
  static type() {
    return "color";
  }
  cook(input_contents, params) {
  }
}
ColorSopOperation.DEFAULT_PARAMS = {
  from_attribute: false,
  attrib_name: "",
  color: new Color2(1, 1, 1),
  as_hsv: false
};
