import {BaseSopOperation} from "./_Base";
import lodash_flatten from "lodash/flatten";
import {CoreLoaderGeometry} from "../../loader/Geometry";
export class FileSopOperation extends BaseSopOperation {
  static type() {
    return "file";
  }
  cook(input_contents, params) {
    const loader = new CoreLoaderGeometry(params.url, this.scene);
    return new Promise((resolve) => {
      loader.load((objects) => {
        const new_objects = this._on_load(objects);
        resolve(this.create_core_group_from_objects(new_objects));
      }, (message) => {
        this._on_error(message, params);
      });
    });
  }
  _on_load(objects) {
    objects = lodash_flatten(objects);
    for (let object of objects) {
      object.traverse((child) => {
        this._ensure_geometry_has_index(child);
        child.matrixAutoUpdate = false;
      });
    }
    return objects;
  }
  _on_error(message, params) {
    this.states?.error.set(`could not load geometry from ${params.url} (${message})`);
  }
  _ensure_geometry_has_index(object) {
    const mesh = object;
    const geometry = mesh.geometry;
    if (geometry) {
      this.create_index_if_none(geometry);
    }
  }
}
FileSopOperation.DEFAULT_PARAMS = {
  url: "/examples/models/wolf.obj"
};
