import {TypedSopNode} from "./_Base";
import lodash_isString from "lodash/isString";
import {AmmoRBDBodyHelper, RBDAttribute} from "../../../core/physics/ammo/RBDBodyHelper";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {AmmoForceHelper} from "../../../core/physics/ammo/ForceHelper";
import Ammo from "ammojs-typed";
const NULL_ID = "";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AmmoSolverSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.start_frame = ParamConfig.INTEGER(1);
    this.gravity = ParamConfig.VECTOR3([0, -9.81, 0]);
    this.max_substeps = ParamConfig.INTEGER(2, {
      range: [1, 10],
      range_locked: [true, false]
    });
    this.reset = ParamConfig.BUTTON(null, {
      callback: (node) => {
        PhysicsSolverSopNode.PARAM_CALLBACK_reset(node);
      }
    });
  }
}
const ParamsConfig2 = new AmmoSolverSopParamsConfig();
export class PhysicsSolverSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.bodies = [];
    this._bodies_by_id = new Map();
    this._bodies_active_state_by_id = new Map();
    this._objects_with_RBDs = [];
  }
  static type() {
    return "physics_solver";
  }
  static displayed_input_names() {
    return ["RBDs", "Forces", "Updated RBD Attributes"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 3);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.ALWAYS, InputCloneMode2.NEVER, InputCloneMode2.NEVER]);
    this.cook_controller.disallow_inputs_evaluation();
    this.add_graph_input(this.scene.time_controller.graph_node);
    Ammo(Ammo).then(() => {
      this.prepare();
    });
  }
  prepare() {
    this._body_helper = new AmmoRBDBodyHelper();
    this._force_helper = new AmmoForceHelper();
    this.config = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher(this.config);
    this.overlappingPairCache = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.config);
    this.world.setGravity(new Ammo.btVector3(0, -10, 0));
    this._gravity = new Ammo.btVector3(0, 0, 0);
  }
  async cook(input_contents) {
    if (this.scene.frame == this.pv.start_frame) {
      this.reset();
    }
    if (!this._input_init) {
      this._input_init = await this._fetch_input_objects(0);
      this.init();
    }
    this._input_force_points = await this._fetch_input_points(1);
    this._input_attributes_update = await this._fetch_input_objects(2);
    this.simulate(0.05);
    this.set_objects(this._objects_with_RBDs);
  }
  async _fetch_input_objects(input_index) {
    const input_node = this.io.inputs.input(input_index);
    if (input_node) {
      const container = await this.container_controller.request_input_container(input_index);
      if (container) {
        const core_group = container.core_content_cloned();
        if (core_group) {
          return core_group.core_objects();
        }
      }
    }
    return [];
  }
  async _fetch_input_points(input_index) {
    const input_node = this.io.inputs.input(input_index);
    if (input_node) {
      const container = await this.container_controller.request_input_container(input_index);
      if (container) {
        const core_group = container.core_content_cloned();
        if (core_group) {
          return core_group.points();
        }
      }
    }
    return void 0;
  }
  init() {
    if (!(this.world && this._gravity && this._input_init && this._body_helper)) {
      return;
    }
    this._gravity.setValue(this.pv.gravity.x, this.pv.gravity.y, this.pv.gravity.z);
    this.world.setGravity(this._gravity);
    for (let i = 0; i < this._input_init.length; i++) {
      const core_object = this._input_init[i];
      this._add_rbd_from_object(core_object, this._body_helper, this.world);
    }
    this._transform_core_objects_from_bodies();
  }
  _create_constraints() {
    const rbd0 = this._bodies_by_id.get("/geo1/physics_rbd_attributes1:0");
    const rbd1 = this._bodies_by_id.get("/geo1/physics_rbd_attributes1:1");
    var pivotA = new Ammo.btVector3(0, 0.5, 0);
    var pivotB = new Ammo.btVector3(0, -0.5, 0);
    var axis = new Ammo.btVector3(0, 1, 0);
    const hinge = new Ammo.btHingeConstraint(rbd0, rbd1, pivotA, pivotB, axis, axis, true);
    const disable_collision_between_linked_bodies = true;
    this.world?.addConstraint(hinge, disable_collision_between_linked_bodies);
  }
  simulate(dt) {
    if (!(this._input_init && this._body_helper)) {
      return;
    }
    this.world?.stepSimulation(dt, this.pv.max_substeps);
    this._apply_custom_forces();
    this._apply_rbd_update();
    this._transform_core_objects_from_bodies();
  }
  _apply_custom_forces() {
    if (!(this._input_force_points && this._force_helper)) {
      return;
    }
    for (let i = 0; i < this._input_force_points.length; i++) {
      this._force_helper.apply_force(this._input_force_points[i], this.bodies);
    }
  }
  _apply_rbd_update() {
    if (!(this._input_attributes_update && this._body_helper)) {
      return;
    }
    for (let core_object of this._input_attributes_update) {
      const id = core_object.attrib_value(RBDAttribute.ID);
      if (lodash_isString(id)) {
        const body = this._bodies_by_id.get(id);
        if (body) {
          this._update_active_state(id, body, core_object);
          this._update_kinematic_transform(body, core_object);
        }
      }
    }
  }
  _update_active_state(id, body, core_object) {
    const current_state = this._bodies_active_state_by_id.get(id);
    const active_attr = core_object.attrib_value(RBDAttribute.ACTIVE);
    const new_state = active_attr == 1;
    if (current_state != new_state) {
      if (new_state == true) {
        this._body_helper?.make_active(body, this.world);
      } else {
        this._body_helper?.make_kinematic(body);
      }
      this._bodies_active_state_by_id.set(id, new_state);
    }
  }
  _update_kinematic_transform(body, core_object) {
    if (this._body_helper && this._body_helper.is_kinematic(body)) {
      this._body_helper.transform_body_from_core_object(body, core_object);
    }
  }
  _transform_core_objects_from_bodies() {
    if (!this._body_helper) {
      return;
    }
    for (let i = 0; i < this._objects_with_RBDs.length; i++) {
      this._body_helper.transform_core_object_from_body(this._objects_with_RBDs[i], this.bodies[i]);
    }
  }
  _add_rbd_from_object(core_object, body_helper, world) {
    const id = body_helper.read_object_attribute(core_object, RBDAttribute.ID, NULL_ID);
    if (id == NULL_ID) {
      console.warn("no id for RBD");
    }
    const body = body_helper.create_body(core_object);
    const simulated = body_helper.read_object_attribute(core_object, RBDAttribute.SIMULATED, false);
    if (simulated) {
      world.addRigidBody(body);
      body_helper.finalize_body(body, core_object);
      this._bodies_by_id.set(id, body);
      this.bodies.push(body);
      this._bodies_active_state_by_id.set(id, body_helper.is_active(body));
    }
    const object = core_object.object();
    this._objects_with_RBDs.push(object);
    object.visible = simulated;
  }
  static PARAM_CALLBACK_reset(node) {
    node.reset();
  }
  reset() {
    if (!this.world) {
      return;
    }
    for (let i = 0; i < this.bodies.length; i++) {
      this.world.removeRigidBody(this.bodies[i]);
    }
    this._bodies_by_id.clear();
    this._bodies_active_state_by_id.clear();
    this.bodies = [];
    this._objects_with_RBDs = [];
    this._input_init = void 0;
    this.scene.set_frame(this.pv.start_frame);
  }
}
