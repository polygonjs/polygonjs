import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {CoreImage} from "../../../core/Image";
export class AttribFromTexture {
  set_attrib(params) {
    const geometry = params.geometry;
    const target_attrib_size = params.target_attrib_size;
    const add = params.add;
    const mult = params.mult / 255;
    const texture_data = this._data_from_texture(params.texture);
    if (!texture_data) {
      return;
    }
    const {data, resx, resy} = texture_data;
    const texture_component_size = data.length / (resx * resy);
    const uv_attrib = geometry.getAttribute(params.uv_attrib_name);
    const uvs = uv_attrib.array;
    const points_count = uvs.length / 2;
    const values = new Array(points_count);
    let uv_stride, uvx, uvy, x, y, j, val;
    let index = 0;
    for (let i = 0; i < points_count; i++) {
      uv_stride = i * 2;
      uvx = uvs[uv_stride];
      uvy = uvs[uv_stride + 1];
      x = Math.floor((resx - 1) * uvx);
      y = Math.floor((resy - 1) * (1 - uvy));
      j = y * resx + x;
      val = data[texture_component_size * j];
      index = i * target_attrib_size;
      values[index] = mult * val + add;
    }
    const array = new Float32Array(values);
    geometry.setAttribute(params.target_attrib_name, new BufferAttribute2(array, target_attrib_size));
  }
  _data_from_texture(texture) {
    if (texture.image) {
      if (texture.image.data) {
        return this._data_from_data_texture(texture);
      }
      return this._data_from_default_texture(texture);
    }
  }
  _data_from_default_texture(texture) {
    const resx = texture.image.width;
    const resy = texture.image.height;
    const image_data = CoreImage.data_from_image(texture.image);
    const data = image_data.data;
    return {
      data,
      resx,
      resy
    };
  }
  _data_from_data_texture(texture) {
    const data = texture.image.data;
    const resx = texture.image.width;
    const resy = texture.image.height;
    return {
      data,
      resx,
      resy
    };
  }
}
