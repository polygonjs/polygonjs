import {Raycaster as Raycaster2} from "three/src/core/Raycaster";
import {MeshBasicMaterial as MeshBasicMaterial2} from "three/src/materials/MeshBasicMaterial";
import {DoubleSide} from "three/src/constants";
import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
const MAT_DOUBLE_SIDED = new MeshBasicMaterial2({
  side: DoubleSide
});
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class RaySopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.use_normals = ParamConfig.BOOLEAN(1);
    this.direction = ParamConfig.VECTOR3([0, -1, 0], {
      visible_if: {use_normals: 0}
    });
    this.transfer_face_normals = ParamConfig.BOOLEAN(1);
  }
}
const ParamsConfig2 = new RaySopParamsConfig();
export class RaySopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._bound_assign_mat = this._assign_double_sided_material_to_object.bind(this);
    this._raycaster = new Raycaster2();
  }
  static type() {
    return "ray";
  }
  static double_sided_material() {
    return MAT_DOUBLE_SIDED;
  }
  static displayed_input_names() {
    return ["geometry to move", "geometry to ray onto"];
  }
  initialize_node() {
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state([
      InputCloneMode2.FROM_NODE,
      InputCloneMode2.ALWAYS
    ]);
  }
  create_params() {
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    const core_group_collision = input_contents[1];
    this.ray(core_group, core_group_collision);
  }
  ray(core_group, core_group_collision) {
    this._assign_double_sided_material_to_core_group(core_group_collision);
    let direction, first_intersect;
    for (let point of core_group.points()) {
      direction = this.pv.use_normals ? point.normal() : this.pv.direction;
      this._raycaster.set(point.position(), direction);
      first_intersect = this._raycaster.intersectObjects(core_group_collision.objects(), true)[0];
      if (first_intersect) {
        point.set_position(first_intersect.point);
        if (this.pv.transfer_face_normals && first_intersect.face) {
          point.set_normal(first_intersect.face.normal);
        }
      }
    }
    this.set_core_group(core_group);
  }
  _assign_double_sided_material_to_core_group(core_group) {
    for (let object of core_group.objects()) {
      object.traverse(this._bound_assign_mat);
    }
  }
  _assign_double_sided_material_to_object(object) {
    object.material = RaySopNode.double_sided_material();
  }
}
