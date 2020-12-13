import {Object3D as Object3D2} from "three/src/core/Object3D";
export class CSS2DObject extends Object3D2 {
  constructor(_element) {
    super();
    this._element = _element;
    this._element.style.position = "absolute";
    this.addEventListener("removed", this._on_removed.bind(this));
  }
  _on_removed() {
    this.traverse(function(object) {
      if (object instanceof CSS2DObject) {
        if (object.element instanceof Element && object.element.parentNode !== null) {
          object.element.parentNode.removeChild(object.element);
        }
      }
    });
  }
  get element() {
    return this._element;
  }
  copy(source, recursive) {
    Object3D2.prototype.copy.call(this, source, recursive);
    this._element = source.element.cloneNode(true);
    this.matrixAutoUpdate = source.matrixAutoUpdate;
    return this;
  }
}
