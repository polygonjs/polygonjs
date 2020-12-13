import {Vector2 as Vector22} from "three/src/math/Vector2";
export class UniformsController {
  constructor(scene) {
    this.scene = scene;
    this._time_dependent_uniform_owners = {};
    this._time_dependent_uniform_owners_ids = null;
    this._resolution = new Vector22(1, 1);
    this._resolution_dependent_uniform_owners = {};
    this._resolution_dependent_uniform_owners_ids = [];
  }
  add_time_dependent_uniform_owner(id, uniforms) {
    this._time_dependent_uniform_owners[id] = uniforms;
    if (!this._time_dependent_uniform_owners_ids) {
      this._time_dependent_uniform_owners_ids = [];
    }
    if (!this._time_dependent_uniform_owners_ids.includes(id)) {
      this._time_dependent_uniform_owners_ids.push(id);
    }
  }
  remove_time_dependent_uniform_owner(id) {
    delete this._time_dependent_uniform_owners[id];
    if (this._time_dependent_uniform_owners_ids) {
      const index = this._time_dependent_uniform_owners_ids.indexOf(id);
      if (index >= 0) {
        this._time_dependent_uniform_owners_ids.splice(index, 1);
      }
    }
  }
  update_time_dependent_uniform_owners() {
    const time = this.scene.time;
    if (this._time_dependent_uniform_owners_ids) {
      for (let id of this._time_dependent_uniform_owners_ids) {
        const uniforms = this._time_dependent_uniform_owners[id];
        uniforms.time.value = time;
      }
    }
  }
  add_resolution_dependent_uniform_owner(id, uniforms) {
    this._resolution_dependent_uniform_owners[id] = uniforms;
    if (!this._resolution_dependent_uniform_owners_ids) {
      this._resolution_dependent_uniform_owners_ids = [];
    }
    if (!this._resolution_dependent_uniform_owners_ids.includes(id)) {
      this._resolution_dependent_uniform_owners_ids.push(id);
    }
    if (this._resolution) {
      this.update_resolution_dependent_uniforms(uniforms);
    }
  }
  remove_resolution_dependent_uniform_owner(id) {
    delete this._resolution_dependent_uniform_owners[id];
    if (this._resolution_dependent_uniform_owners_ids) {
      const index = this._resolution_dependent_uniform_owners_ids.indexOf(id);
      if (index >= 0) {
        this._resolution_dependent_uniform_owners_ids.splice(index, 1);
      }
    }
  }
  update_resolution_dependent_uniform_owners(resolution) {
    this._resolution.copy(resolution);
    for (let id of this._resolution_dependent_uniform_owners_ids) {
      const uniforms = this._resolution_dependent_uniform_owners[id];
      this.update_resolution_dependent_uniforms(uniforms);
    }
  }
  update_resolution_dependent_uniforms(uniforms) {
    uniforms.resolution.value.x = this._resolution.x * window.devicePixelRatio;
    uniforms.resolution.value.y = this._resolution.y * window.devicePixelRatio;
  }
}
