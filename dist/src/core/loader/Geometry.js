import {ObjectLoader as ObjectLoader2} from "three/src/loaders/ObjectLoader";
import {Object3D as Object3D2} from "three/src/core/Object3D";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {Poly as Poly2} from "../../engine/Poly";
import {ModuleName} from "../../engine/poly/registers/modules/_BaseRegister";
import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {Points as Points2} from "three/src/objects/Points";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {MeshLambertMaterial as MeshLambertMaterial2} from "three/src/materials/MeshLambertMaterial";
import {PointsMaterial as PointsMaterial2} from "three/src/materials/PointsMaterial";
import {UAParser} from "ua-parser-js";
var GeometryExtension;
(function(GeometryExtension2) {
  GeometryExtension2["DRC"] = "drc";
  GeometryExtension2["FBX"] = "fbx";
  GeometryExtension2["GLTF"] = "gltf";
  GeometryExtension2["GLB"] = "glb";
  GeometryExtension2["OBJ"] = "obj";
  GeometryExtension2["PDB"] = "pdb";
  GeometryExtension2["PLY"] = "ply";
})(GeometryExtension || (GeometryExtension = {}));
const CoreLoaderGeometry2 = class {
  constructor(url, scene) {
    this.url = url;
    this.scene = scene;
    this.ext = CoreLoaderGeometry2.get_extension(url);
  }
  static get_extension(url) {
    let _url;
    let ext = null;
    try {
      _url = new URL(url);
      ext = _url.searchParams.get("ext");
    } catch (e) {
    }
    if (!ext) {
      const url_without_params = url.split("?")[0];
      const elements = url_without_params.split(".");
      ext = elements[elements.length - 1].toLowerCase();
    }
    return ext;
  }
  load(on_success, on_error) {
    this.load_auto().then((object) => {
      on_success(object);
    }).catch((error) => {
      on_error(error);
    });
  }
  load_auto() {
    return new Promise(async (resolve, reject) => {
      let url = this.url;
      if (url[0] != "h") {
        const assets_root = this.scene.assets_controller.assets_root();
        if (assets_root) {
          url = `${assets_root}${url}`;
        }
      }
      if (this.ext == "json") {
        CoreLoaderGeometry2.increment_in_progress_loads_count();
        await CoreLoaderGeometry2.wait_for_max_concurrent_loads_queue_freed();
        fetch(url).then(async (response) => {
          const data = await response.json();
          const obj_loader = new ObjectLoader2();
          obj_loader.parse(data, (obj) => {
            CoreLoaderGeometry2.decrement_in_progress_loads_count();
            resolve(this.on_load_success(obj.children[0]));
          });
        }).catch((error) => {
          CoreLoaderGeometry2.decrement_in_progress_loads_count();
          reject(error);
        });
      } else {
        const loader = await this.loader_for_ext();
        if (loader) {
          CoreLoaderGeometry2.increment_in_progress_loads_count();
          await CoreLoaderGeometry2.wait_for_max_concurrent_loads_queue_freed();
          loader.load(url, (object) => {
            this.on_load_success(object).then((object2) => {
              CoreLoaderGeometry2.decrement_in_progress_loads_count();
              resolve(object2);
            });
          }, void 0, (error_message) => {
            Poly2.warn("error loading", url, error_message);
            CoreLoaderGeometry2.decrement_in_progress_loads_count();
            reject(error_message);
          });
        } else {
          const error_message = `format not supported (${this.ext})`;
          reject(error_message);
        }
      }
    });
  }
  async on_load_success(object) {
    if (object instanceof Object3D2) {
      switch (this.ext) {
        case GeometryExtension.GLTF:
          return this.on_load_succes_gltf(object);
        case GeometryExtension.GLB:
          return this.on_load_succes_gltf(object);
        case GeometryExtension.OBJ:
          return [object];
        case "json":
          return [object];
        default:
          return [object];
      }
    }
    if (object instanceof BufferGeometry2) {
      switch (this.ext) {
        case GeometryExtension.DRC:
          return this.on_load_succes_drc(object);
        default:
          return [new Mesh2(object)];
      }
    }
    switch (this.ext) {
      case GeometryExtension.GLTF:
        return this.on_load_succes_gltf(object);
      case GeometryExtension.GLB:
        return this.on_load_succes_gltf(object);
      case GeometryExtension.PDB:
        return this.on_load_succes_pdb(object);
      default:
        return [];
    }
    return [];
  }
  on_load_succes_drc(geometry) {
    const mesh = new Mesh2(geometry, CoreLoaderGeometry2._default_mat_mesh);
    return [mesh];
  }
  on_load_succes_gltf(gltf) {
    const scene = gltf["scene"];
    scene.animations = gltf.animations;
    return [scene];
  }
  on_load_succes_pdb(pdb_object) {
    const atoms = new Points2(pdb_object.geometryAtoms, CoreLoaderGeometry2._default_mat_point);
    const bonds = new LineSegments2(pdb_object.geometryBonds, CoreLoaderGeometry2._default_mat_line);
    return [atoms, bonds];
  }
  static module_names(ext) {
    switch (ext) {
      case GeometryExtension.DRC:
        return [ModuleName.DRACOLoader];
      case GeometryExtension.FBX:
        return [ModuleName.FBXLoader];
      case GeometryExtension.GLTF:
        return [ModuleName.GLTFLoader];
      case GeometryExtension.GLB:
        return [ModuleName.GLTFLoader, ModuleName.DRACOLoader];
      case GeometryExtension.OBJ:
        return [ModuleName.OBJLoader2];
      case GeometryExtension.PDB:
        return [ModuleName.PDBLoader];
      case GeometryExtension.PLY:
        return [ModuleName.PLYLoader];
    }
  }
  async loader_for_ext() {
    switch (this.ext.toLowerCase()) {
      case GeometryExtension.DRC:
        return this.loader_for_drc();
      case GeometryExtension.FBX:
        return this.loader_for_fbx();
      case GeometryExtension.GLTF:
        return this.loader_for_gltf();
      case GeometryExtension.GLB:
        return this.loader_for_glb();
      case GeometryExtension.OBJ:
        return this.loader_for_obj();
      case GeometryExtension.PDB:
        return this.loader_for_pdb();
      case GeometryExtension.PLY:
        return this.loader_for_ply();
    }
  }
  async loader_for_drc() {
    const module = await Poly2.instance().modules_register.module(ModuleName.DRACOLoader);
    if (module) {
      const draco_loader = new module.DRACOLoader();
      const root = this.scene.libs_controller.root();
      const decoder_path = `${root}/draco/`;
      draco_loader.setDecoderPath(decoder_path);
      draco_loader.setDecoderConfig({type: "js"});
      return draco_loader;
    }
  }
  async loader_for_fbx() {
    const module = await Poly2.instance().modules_register.module(ModuleName.FBXLoader);
    if (module) {
      return new module.FBXLoader();
    }
  }
  async loader_for_gltf() {
    const module = await Poly2.instance().modules_register.module(ModuleName.GLTFLoader);
    if (module) {
      return new module.GLTFLoader();
    }
  }
  static async loader_for_glb(scene) {
    const gltf_module = await Poly2.instance().modules_register.module(ModuleName.GLTFLoader);
    const draco_module = await Poly2.instance().modules_register.module(ModuleName.DRACOLoader);
    if (gltf_module && draco_module) {
      this.gltf_loader = this.gltf_loader || new gltf_module.GLTFLoader();
      this.draco_loader = this.draco_loader || new draco_module.DRACOLoader();
      const root = scene.libs_controller.root();
      const decoder_path = `${root}/draco/gltf/`;
      this.draco_loader.setDecoderPath(decoder_path);
      this.gltf_loader.setDRACOLoader(this.draco_loader);
      return this.gltf_loader;
    }
  }
  async loader_for_glb() {
    return CoreLoaderGeometry2.loader_for_glb(this.scene);
  }
  async loader_for_obj() {
    const module = await Poly2.instance().modules_register.module(ModuleName.OBJLoader2);
    if (module) {
      return new module.OBJLoader2();
    }
  }
  async loader_for_pdb() {
    const module = await Poly2.instance().modules_register.module(ModuleName.PDBLoader);
    if (module) {
      return new module.PDBLoader();
    }
  }
  async loader_for_ply() {
    const module = await Poly2.instance().modules_register.module(ModuleName.PLYLoader);
    if (module) {
      return new module.PLYLoader();
    }
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
        Chrome: 1,
        Firefox: 10,
        Safari: 10
      };
      const delay = delay_by_browser[name];
      if (delay != null) {
        return delay;
      }
    }
    return 10;
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
export let CoreLoaderGeometry = CoreLoaderGeometry2;
CoreLoaderGeometry._default_mat_mesh = new MeshLambertMaterial2();
CoreLoaderGeometry._default_mat_point = new PointsMaterial2();
CoreLoaderGeometry._default_mat_line = new LineBasicMaterial2();
CoreLoaderGeometry.MAX_CONCURRENT_LOADS_COUNT = CoreLoaderGeometry2._init_max_concurrent_loads_count();
CoreLoaderGeometry.CONCURRENT_LOADS_DELAY = CoreLoaderGeometry2._init_concurrent_loads_delay();
CoreLoaderGeometry.in_progress_loads_count = 0;
CoreLoaderGeometry._queue = [];
