import {TypedContainer} from "./_Base";
export class MaterialContainer extends TypedContainer {
  set_content(content) {
    super.set_content(content);
  }
  set_material(material) {
    if (this._content != null) {
      this._content.dispose();
    }
    this.set_content(material);
  }
  has_material() {
    return this.has_content();
  }
  material() {
    return this.content();
  }
}
