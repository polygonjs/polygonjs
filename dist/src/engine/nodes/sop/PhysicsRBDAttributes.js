import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {RBDAttribute, RBD_SHAPES, RBDShape} from "../../../core/physics/ammo/RBDBodyHelper";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {TypeAssert} from "../../poly/Assert";
var RBDAttributeMode;
(function(RBDAttributeMode2) {
  RBDAttributeMode2["OBJECTS"] = "objects";
  RBDAttributeMode2["POINTS"] = "points";
})(RBDAttributeMode || (RBDAttributeMode = {}));
const RBD_ATTRIBUTE_MODES = [RBDAttributeMode.OBJECTS, RBDAttributeMode.POINTS];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PhysicsRBDAttributesSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mode = ParamConfig.INTEGER(RBD_ATTRIBUTE_MODES.indexOf(RBDAttributeMode.OBJECTS), {
      menu: {
        entries: RBD_ATTRIBUTE_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.active = ParamConfig.BOOLEAN(1);
    this.shape = ParamConfig.INTEGER(RBD_SHAPES.indexOf(RBDShape.BOX), {
      menu: {
        entries: RBD_SHAPES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.add_id = ParamConfig.BOOLEAN(1);
    this.mass = ParamConfig.FLOAT(1);
    this.restitution = ParamConfig.FLOAT(0.5);
    this.damping = ParamConfig.FLOAT(0);
    this.angular_damping = ParamConfig.FLOAT(0);
    this.friction = ParamConfig.FLOAT(0.5);
    this.simulated = ParamConfig.FLOAT(1);
  }
}
const ParamsConfig2 = new PhysicsRBDAttributesSopParamsConfig();
export class PhysicsRBDAttributesSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._bbox_size = new Vector32();
    this._object_t = new Vector32();
    this._object_q = new Quaternion2();
    this._object_s = new Vector32();
  }
  static type() {
    return "physics_rbd_attributes";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    if (RBD_ATTRIBUTE_MODES[this.pv.mode] == RBDAttributeMode.OBJECTS) {
      this._add_object_attributes(input_contents[0]);
    } else {
      this._add_point_attributes(input_contents[0]);
    }
    this.set_core_group(input_contents[0]);
  }
  _add_object_attributes(core_group) {
    const core_objects = core_group.core_objects();
    let core_object;
    for (let i = 0; i < core_objects.length; i++) {
      core_object = core_objects[i];
      core_object.set_attrib_value(RBDAttribute.ACTIVE, this.pv.active ? 1 : 0);
      core_object.set_attrib_value(RBDAttribute.MASS, this.pv.mass);
      core_object.set_attrib_value(RBDAttribute.RESTITUTION, this.pv.restitution);
      core_object.set_attrib_value(RBDAttribute.DAMPING, this.pv.damping);
      core_object.set_attrib_value(RBDAttribute.ANGULAR_DAMPING, this.pv.angular_damping);
      core_object.set_attrib_value(RBDAttribute.FRICTION, this.pv.friction);
      core_object.set_attrib_value(RBDAttribute.SIMULATED, this.pv.simulated);
      if (this.pv.add_id == true) {
        core_object.set_attrib_value(RBDAttribute.ID, `${this.full_path()}:${i}`);
      }
      this._add_object_shape_specific_attributes(core_object);
    }
  }
  _add_object_shape_specific_attributes(core_object) {
    core_object.set_attrib_value(RBDAttribute.SHAPE, this.pv.shape);
    const shape = RBD_SHAPES[this.pv.shape];
    const object = core_object.object();
    object.matrix.decompose(this._object_t, this._object_q, this._object_s);
    switch (shape) {
      case RBDShape.BOX: {
        const geometry = object.geometry;
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        if (bbox) {
          bbox.getSize(this._bbox_size);
          this._bbox_size.multiply(this._object_s);
          core_object.set_attrib_value(RBDAttribute.SHAPE_SIZE_BOX, this._bbox_size);
        }
        return;
      }
      case RBDShape.SPHERE: {
        const geometry = object.geometry;
        geometry.computeBoundingSphere();
        const bounding_sphere = geometry.boundingSphere;
        if (bounding_sphere) {
          const diameter = 2 * bounding_sphere.radius * this._object_s.x;
          core_object.set_attrib_value(RBDAttribute.SHAPE_SIZE_SPHERE, diameter);
        }
        return;
      }
    }
    TypeAssert.unreachable(shape);
  }
  _add_point_attributes(core_group) {
    for (let core_point of core_group.points()) {
      core_point.set_attrib_value(RBDAttribute.ACTIVE, this.pv.active ? 1 : 0);
    }
  }
}
