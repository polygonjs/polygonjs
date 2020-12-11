import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {FlagsControllerBO} from "../utils/FlagsController";
import {DataTexture as DataTexture2} from "three/src/textures/DataTexture";
import {LuminanceFormat, HalfFloatType} from "three/src/constants";
const INPUT_COP_NAME = "input texture";
const DEFAULT_INPUT_NAMES = [INPUT_COP_NAME, INPUT_COP_NAME, INPUT_COP_NAME, INPUT_COP_NAME];
var size = 32;
var data = new Uint16Array(size);
for (var i = 0; i < size; i++) {
  data[i] = 28898;
}
const EMPTY_DATA_TEXTURE = new DataTexture2(data, size, 1, LuminanceFormat, HalfFloatType);
export class TypedCopNode extends TypedNode {
  constructor(scene) {
    super(scene, "BaseCopNode");
    this.flags = new FlagsControllerBO(this);
  }
  static node_context() {
    return NodeContext2.COP;
  }
  static displayed_input_names() {
    return DEFAULT_INPUT_NAMES;
  }
  initialize_base_node() {
    this.io.outputs.set_has_one_output();
  }
  set_texture(texture) {
    texture.name = this.full_path();
    this.set_container(texture);
  }
  clear_texture() {
    this.set_container(EMPTY_DATA_TEXTURE);
  }
}
export class BaseCopNodeClass extends TypedCopNode {
}
