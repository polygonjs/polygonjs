import {TypedContainer} from "./_Base";
export class TextureContainer extends TypedContainer {
  set_content(content) {
    super.set_content(content);
  }
  texture() {
    return this._content;
  }
  core_content() {
    return this._content;
  }
  core_content_cloned() {
    const texture = this._content?.clone();
    if (texture) {
      texture.needsUpdate = true;
    }
    return texture;
  }
  object() {
    return this.texture();
  }
  infos() {
    if (this._content != null) {
      return [this._content];
    }
  }
  resolution() {
    if (this._content) {
      if (this._content.image) {
        return [this._content.image.width, this._content.image.height];
      }
    }
    return [-1, -1];
  }
}
