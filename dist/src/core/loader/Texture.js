import {VideoTexture as VideoTexture2} from "three/src/textures/VideoTexture";
import {TextureLoader as TextureLoader2} from "three/src/loaders/TextureLoader";
import {UnsignedByteType} from "three/src/constants";
import {CoreWalker} from "../Walker";
import {BaseCopNodeClass} from "../../engine/nodes/cop/_Base";
import {Poly as Poly2} from "../../engine/Poly";
import {ModuleName} from "../../engine/poly/registers/modules/_BaseRegister";
import {UAParser} from "ua-parser-js";
var Extension;
(function(Extension2) {
  Extension2["EXR"] = "exr";
  Extension2["BASIS"] = "basis";
  Extension2["HDR"] = "hdr";
})(Extension || (Extension = {}));
const CoreTextureLoader2 = class {
  constructor(_node, _param) {
    this._node = _node;
    this._param = _param;
  }
  async load_texture_from_url_or_op(url) {
    let texture = null;
    let found_node;
    if (url.substring(0, 3) == "op:") {
      const node_path = url.substring(3);
      found_node = CoreWalker.find_node(this._node, node_path);
      if (found_node) {
        if (found_node instanceof BaseCopNodeClass) {
          const container = await found_node.request_container();
          texture = container.texture();
        } else {
          this._node.states.error.set(`found node is not a texture node`);
        }
      } else {
        this._node.states.error.set(`no node found in path '${node_path}'`);
      }
    } else {
      texture = await this.load_url(url);
      if (texture) {
        if (this._param.options.texture_as_env()) {
        } else {
          texture = CoreTextureLoader2.set_texture_for_mapping(texture);
        }
      } else {
        this._node.states.error.set(`could not load texture ${url}`);
      }
    }
    if (found_node && this._param.graph_predecessors()[0] != found_node) {
      this._param.graph_disconnect_predecessors();
      this._param.add_graph_input(found_node);
    }
    return texture;
  }
  async load_url(url) {
    return new Promise(async (resolve, reject) => {
      const ext = CoreTextureLoader2.get_extension(url);
      if (url[0] != "h") {
        const assets_root = this._node.scene.assets_controller.assets_root();
        if (assets_root) {
          url = `${assets_root}${url}`;
        }
      }
      if (CoreTextureLoader2.VIDEO_EXTENSIONS.includes(ext)) {
        const texture = await this._load_as_video(url);
        resolve(texture);
      } else {
        this.loader_for_ext(ext).then(async (loader) => {
          if (loader) {
            CoreTextureLoader2.increment_in_progress_loads_count();
            await CoreTextureLoader2.wait_for_max_concurrent_loads_queue_freed();
            loader.load(url, (texture) => {
              CoreTextureLoader2.decrement_in_progress_loads_count();
              resolve(texture);
            }, void 0, (error) => {
              CoreTextureLoader2.decrement_in_progress_loads_count();
              Poly2.warn("error", error);
              reject();
            });
          } else {
            reject();
          }
        });
      }
    });
  }
  static module_names(ext) {
    switch (ext) {
      case Extension.EXR:
        return [ModuleName.EXRLoader];
      case Extension.HDR:
        return [ModuleName.RGBELoader];
      case Extension.BASIS:
        return [ModuleName.BasisTextureLoader];
    }
  }
  async loader_for_ext(ext) {
    const ext_lowercase = ext.toLowerCase();
    switch (ext_lowercase) {
      case Extension.EXR: {
        return await this._exr_loader();
      }
      case Extension.HDR: {
        return await this._hdr_loader();
      }
      case Extension.BASIS: {
        return await this._basis_loader();
      }
    }
    return new TextureLoader2();
  }
  async _exr_loader() {
    const module = await Poly2.instance().modules_register.module(ModuleName.EXRLoader);
    if (module) {
      return new module.EXRLoader();
    }
  }
  async _hdr_loader() {
    const module = await Poly2.instance().modules_register.module(ModuleName.RGBELoader);
    if (module) {
      const loader = new module.RGBELoader();
      loader.setDataType(UnsignedByteType);
      return loader;
    }
  }
  async _basis_loader() {
    const module = await Poly2.instance().modules_register.module(ModuleName.BasisTextureLoader);
    if (module) {
      const loader = new module.BasisTextureLoader();
      loader.setTranscoderPath("/three/js/libs/basis/");
      const renderer = await Poly2.instance().renderers_controller.wait_for_renderer();
      if (renderer) {
        loader.detectSupport(renderer);
      } else {
        Poly2.warn("texture loader found no renderer for basis texture loader");
      }
      return loader;
    }
  }
  _load_as_video(url) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.setAttribute("crossOrigin", "anonymous");
      video.setAttribute("autoplay", `${true}`);
      video.setAttribute("loop", `${true}`);
      video.onloadedmetadata = function() {
        video.pause();
        const texture = new VideoTexture2(video);
        resolve(texture);
      };
      const original_source = document.createElement("source");
      const original_ext = CoreTextureLoader2.get_extension(url);
      let type = CoreTextureLoader2.VIDEO_SOURCE_TYPE_BY_EXT[original_ext];
      type = type || CoreTextureLoader2._default_video_source_type(url);
      original_source.setAttribute("type", type);
      original_source.setAttribute("src", url);
      video.appendChild(original_source);
      let secondary_url = url;
      if (original_ext == "mp4") {
        secondary_url = CoreTextureLoader2.replace_extension(url, "ogv");
      } else {
        secondary_url = CoreTextureLoader2.replace_extension(url, "mp4");
      }
      const secondary_source = document.createElement("source");
      const secondary_ext = CoreTextureLoader2.get_extension(secondary_url);
      type = CoreTextureLoader2.VIDEO_SOURCE_TYPE_BY_EXT[secondary_ext];
      type = type || CoreTextureLoader2._default_video_source_type(url);
      secondary_source.setAttribute("type", type);
      secondary_source.setAttribute("src", url);
      video.appendChild(secondary_source);
    });
  }
  static _default_video_source_type(url) {
    const ext = this.get_extension(url);
    return `video/${ext}`;
  }
  static pixel_data(texture) {
    const img = texture.image;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(img, 0, 0, img.width, img.height);
      return context.getImageData(0, 0, img.width, img.height);
    }
  }
  static get_extension(url) {
    const elements = url.split(".");
    return elements[elements.length - 1].toLowerCase();
  }
  static replace_extension(url, new_extension) {
    const elements = url.split("?");
    const url_without_params = elements[0];
    const url_elements = url_without_params.split(".");
    url_elements.pop();
    url_elements.push(new_extension);
    return [url_elements.join("."), elements[1]].join("?");
  }
  static set_texture_for_mapping(texture) {
    return texture;
  }
  static _init_max_concurrent_loads_count() {
    const parser = new UAParser();
    const name = parser.getBrowser().name;
    if (name) {
      const loads_count_by_browser = {
        Chrome: 10,
        Firefox: 4
      };
      const loads_count = loads_count_by_browser[name];
      if (loads_count != null) {
        return loads_count;
      }
    }
    return 1;
  }
  static _init_concurrent_loads_delay() {
    const parser = new UAParser();
    const name = parser.getBrowser().name;
    if (name) {
      const delay_by_browser = {
        Chrome: 0,
        Firefox: 10
      };
      const delay = delay_by_browser[name];
      if (delay != null) {
        return delay;
      }
    }
    return 100;
  }
  static override_max_concurrent_loads_count(count) {
    this.MAX_CONCURRENT_LOADS_COUNT = count;
  }
  static increment_in_progress_loads_count() {
    this.in_progress_loads_count++;
  }
  static decrement_in_progress_loads_count() {
    this.in_progress_loads_count--;
    const queued_resolve = this._queue.pop();
    if (queued_resolve) {
      const delay = this.CONCURRENT_LOADS_DELAY;
      setTimeout(() => {
        queued_resolve();
      }, delay);
    }
  }
  static async wait_for_max_concurrent_loads_queue_freed() {
    if (this.in_progress_loads_count <= this.MAX_CONCURRENT_LOADS_COUNT) {
      return;
    } else {
      return new Promise((resolve) => {
        this._queue.push(resolve);
      });
    }
  }
};
export let CoreTextureLoader = CoreTextureLoader2;
CoreTextureLoader.PARAM_DEFAULT = "/examples/textures/uv.jpg";
CoreTextureLoader.PARAM_ENV_DEFAULT = "/examples/textures/piz_compressed.exr";
CoreTextureLoader.VIDEO_EXTENSIONS = ["mp4", "webm", "ogv"];
CoreTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT = {
  ogg: 'video/ogg; codecs="theora, vorbis"',
  ogv: 'video/ogg; codecs="theora, vorbis"',
  mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
};
CoreTextureLoader.MAX_CONCURRENT_LOADS_COUNT = CoreTextureLoader2._init_max_concurrent_loads_count();
CoreTextureLoader.CONCURRENT_LOADS_DELAY = CoreTextureLoader2._init_concurrent_loads_delay();
CoreTextureLoader.in_progress_loads_count = 0;
CoreTextureLoader._queue = [];
