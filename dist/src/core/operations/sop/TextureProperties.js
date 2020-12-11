import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
import {Poly as Poly2} from "../../../engine/Poly";
import {MAG_FILTER_DEFAULT_VALUE, MIN_FILTER_DEFAULT_VALUE} from "../../../core/cop/ConstantFilter";
export class TexturePropertiesSopOperation extends BaseSopOperation {
  static type() {
    return "texture_properties";
  }
  async cook(input_contents, params) {
    const core_group = input_contents[0];
    const objects = [];
    for (let object of core_group.objects()) {
      if (params.apply_to_children) {
        object.traverse((child) => {
          objects.push(child);
        });
      } else {
        objects.push(object);
      }
    }
    const promises = objects.map((object) => this._update_object(object, params));
    await Promise.all(promises);
    return core_group;
  }
  async _update_object(object, params) {
    const material = object.material;
    if (material) {
      await this._update_material(material, params);
    }
  }
  async _update_material(material, params) {
    let texture = material.map;
    if (texture) {
      await this._update_texture(texture, params);
    }
  }
  async _update_texture(texture, params) {
    if (params.tanisotropy) {
      await this._update_anisotropy(texture, params);
    }
    if (params.tminfilter || params.tmaxfilter) {
      this._update_filter(texture, params);
    }
  }
  async _update_anisotropy(texture, params) {
    if (params.use_renderer_max_anisotropy) {
      const renderer = await Poly2.instance().renderers_controller.first_renderer();
      if (renderer) {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
    } else {
      texture.anisotropy = params.anisotropy;
    }
  }
  _update_filter(texture, params) {
    if (params.tminfilter) {
      texture.minFilter = params.min_filter;
    }
    if (params.tmagfilter) {
      texture.magFilter = params.mag_filter;
    }
  }
}
TexturePropertiesSopOperation.DEFAULT_PARAMS = {
  apply_to_children: false,
  tanisotropy: false,
  use_renderer_max_anisotropy: false,
  anisotropy: 1,
  tmin_filter: false,
  min_filter: MIN_FILTER_DEFAULT_VALUE,
  tmag_filter: false,
  mag_filter: MAG_FILTER_DEFAULT_VALUE
};
TexturePropertiesSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
