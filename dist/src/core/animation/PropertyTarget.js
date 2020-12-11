import {CoreString} from "../String";
export class PropertyTarget {
  clone() {
    const property_target = new PropertyTarget();
    if (this._node_path) {
      property_target.set_node_path(this._node_path);
    }
    if (this._object_mask) {
      property_target.set_object_mask(this._object_mask);
    }
    return property_target;
  }
  set_node_path(node_path) {
    this._node_path = node_path;
  }
  set_object_mask(object_mask) {
    this._object_mask = object_mask;
  }
  objects(scene) {
    const objects = [];
    const mask = this._object_mask;
    if (!mask) {
      return;
    }
    scene.default_scene.traverse((object) => {
      if (CoreString.match_mask(object.name, mask)) {
        objects.push(object);
      }
    });
    return objects;
  }
  node(scene) {
    if (!this._node_path) {
      return;
    }
    return scene.node(this._node_path);
  }
}
