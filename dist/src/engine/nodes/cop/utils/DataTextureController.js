import {DataTexture as DataTexture2} from "three/src/textures/DataTexture";
import {TypeAssert} from "../../../poly/Assert";
import {CoreImage} from "../../../../core/Image";
export var DataTextureControllerBufferType;
(function(DataTextureControllerBufferType2) {
  DataTextureControllerBufferType2["Uint8Array"] = "Uint8Array";
  DataTextureControllerBufferType2["Uint8ClampedArray"] = "Uint8ClampedArray";
  DataTextureControllerBufferType2["Float32Array"] = "Float32Array";
})(DataTextureControllerBufferType || (DataTextureControllerBufferType = {}));
export class DataTextureController {
  constructor(buffer_type) {
    this.buffer_type = buffer_type;
  }
  from_render_target(renderer, render_target) {
    if (!this._data_texture || !this._same_dimensions(render_target.texture)) {
      this._data_texture = this._create_data_texture(render_target.texture);
    }
    this._copy_to_data_texture(renderer, render_target);
    return this._data_texture;
  }
  from_texture(texture) {
    const src_data = CoreImage.data_from_image(texture.image);
    if (!this._data_texture || !this._same_dimensions(texture)) {
      this._data_texture = this._create_data_texture(texture);
    }
    const length = src_data.width * src_data.height;
    const src_tex_data = src_data.data;
    const dest_ext_data = this._data_texture.image.data;
    const stride = 4;
    const l4 = length * stride;
    for (let i = 0; i < l4; i++) {
      dest_ext_data[i] = src_tex_data[i];
    }
    return this._data_texture;
  }
  get data_texture() {
    return this._data_texture;
  }
  reset() {
    this._data_texture = void 0;
  }
  _copy_to_data_texture(renderer, render_target) {
    const image = render_target.texture.image;
    this._data_texture = this._data_texture || this._create_data_texture(render_target.texture);
    renderer.readRenderTargetPixels(render_target, 0, 0, image.width, image.height, this._data_texture.image.data);
    this._data_texture.needsUpdate = true;
  }
  _create_data_texture(texture) {
    const image = texture.image;
    const pixel_buffer = this._create_pixel_buffer(image.width, image.height);
    const data_texture = new DataTexture2(pixel_buffer, image.width, image.height, texture.format, texture.type, texture.mapping, texture.wrapS, texture.wrapT, texture.magFilter, texture.minFilter, texture.anisotropy, texture.encoding);
    return data_texture;
  }
  _create_pixel_buffer(width, height) {
    const size = width * height * 4;
    switch (this.buffer_type) {
      case DataTextureControllerBufferType.Uint8Array:
        return new Uint8Array(size);
      case DataTextureControllerBufferType.Uint8ClampedArray:
        return new Uint8ClampedArray(size);
      case DataTextureControllerBufferType.Float32Array:
        return new Float32Array(size);
    }
    TypeAssert.unreachable(this.buffer_type);
  }
  _same_dimensions(texture) {
    if (this._data_texture) {
      const same_w = this._data_texture.image.width == texture.image.width;
      const same_h = this._data_texture.image.height == texture.image.height;
      return same_w && same_h;
    } else {
      return true;
    }
  }
}
