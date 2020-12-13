import lodash_times from "lodash/times";
import {TypedNode} from "../_Base";
import {CoreGroup} from "../../../core/geometry/Group";
import {ObjectType} from "../../../core/geometry/Constant";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {FlagsControllerDBO} from "../utils/FlagsController";
import {BaseSopOperation} from "../../../core/operations/sop/_Base";
var MESSAGE;
(function(MESSAGE2) {
  MESSAGE2["FROM_SET_CORE_GROUP"] = "from set_core_group";
  MESSAGE2["FROM_SET_GROUP"] = "from set_group";
  MESSAGE2["FROM_SET_OBJECTS"] = "from set_objects";
  MESSAGE2["FROM_SET_OBJECT"] = "from set_object";
  MESSAGE2["FROM_SET_GEOMETRIES"] = "from set_geometries";
  MESSAGE2["FROM_SET_GEOMETRY"] = "from set_geometry";
})(MESSAGE || (MESSAGE = {}));
const INPUT_GEOMETRY_NAME = "input geometry";
const DEFAULT_INPUT_NAMES = [INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME];
class ParamLessNetworkSopParamsConfig extends NodeParamsConfig {
}
export class BaseNetworkSopNode extends TypedNode {
  static node_context() {
    return NodeContext2.SOP;
  }
  cook() {
    this.cook_controller.end_cook();
  }
}
export class ParamLessBaseNetworkSopNode extends BaseNetworkSopNode {
}
export class TypedSopNode extends TypedNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerDBO(this);
  }
  static node_context() {
    return NodeContext2.SOP;
  }
  static displayed_input_names() {
    return DEFAULT_INPUT_NAMES;
  }
  initialize_base_node() {
    this.flags.display.set(false);
    this.flags.display.add_hook(() => {
      if (this.flags.display.active) {
        const parent = this.parent;
        if (parent && parent.display_node_controller) {
          parent.display_node_controller.set_display_node(this);
        }
      }
    });
    this.io.outputs.set_has_one_output();
  }
  set_core_group(core_group) {
    this.set_container(core_group, MESSAGE.FROM_SET_CORE_GROUP);
  }
  set_object(object) {
    this.set_container_objects([object], MESSAGE.FROM_SET_OBJECT);
  }
  set_objects(objects) {
    this.set_container_objects(objects, MESSAGE.FROM_SET_OBJECTS);
  }
  set_geometry(geometry, type = ObjectType.MESH) {
    const object = this.create_object(geometry, type);
    this.set_container_objects([object], MESSAGE.FROM_SET_GEOMETRY);
  }
  set_geometries(geometries, type = ObjectType.MESH) {
    const objects = [];
    let object;
    for (let geometry of geometries) {
      object = this.create_object(geometry, type);
      objects.push(object);
    }
    this.set_container_objects(objects, MESSAGE.FROM_SET_GEOMETRIES);
  }
  set_container_objects(objects, message) {
    const core_group = this.container_controller.container.core_content() || new CoreGroup();
    core_group.set_objects(objects);
    core_group.touch();
    this.set_container(core_group);
  }
  static create_object(geometry, type, material) {
    return BaseSopOperation.create_object(geometry, type, material);
  }
  create_object(geometry, type, material) {
    return TypedSopNode.create_object(geometry, type, material);
  }
  static create_index_if_none(geometry) {
    BaseSopOperation.create_index_if_none(geometry);
  }
  _create_index_if_none(geometry) {
    TypedSopNode.create_index_if_none(geometry);
  }
  _add_index(geometry) {
    const position_attrib = geometry.getAttribute("position");
    const position_array = position_attrib.array;
    const points_count = position_array.length / 3;
    const indices = [];
    lodash_times(points_count, (i) => indices.push(i));
    geometry.setIndex(indices);
  }
}
export class BaseSopNodeClass extends TypedSopNode {
}
