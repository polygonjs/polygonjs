import lodash_range from "lodash/range";
import {TypedSopNode} from "./_Base";
import {ObjectType} from "../../../core/geometry/Constant";
import {TextBufferGeometry as TextBufferGeometry2} from "three/src/geometries/TextBufferGeometry";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {ShapeBufferGeometry as ShapeBufferGeometry2} from "three/src/geometries/ShapeBufferGeometry";
import {FontLoader as FontLoader2} from "three/src/loaders/FontLoader";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometryUtils as BufferGeometryUtils2} from "../../../modules/three/examples/jsm/utils/BufferGeometryUtils";
const DEFAULT_FONT_URL = "/fonts/droid_sans_regular.typeface.json";
export var TEXT_TYPE;
(function(TEXT_TYPE2) {
  TEXT_TYPE2["MESH"] = "mesh";
  TEXT_TYPE2["FLAT"] = "flat";
  TEXT_TYPE2["LINE"] = "line";
  TEXT_TYPE2["STROKE"] = "stroke";
})(TEXT_TYPE || (TEXT_TYPE = {}));
export const TEXT_TYPES = [TEXT_TYPE.MESH, TEXT_TYPE.FLAT, TEXT_TYPE.LINE, TEXT_TYPE.STROKE];
const GENERATION_ERROR_MESSAGE = `failed to generate geometry. Try to remove some characters`;
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ModuleName} from "../../poly/registers/modules/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
class TextSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.font = ParamConfig.STRING(DEFAULT_FONT_URL, {
      asset_reference: true
    });
    this.text = ParamConfig.STRING("polygonjs", {multiline: true});
    this.type = ParamConfig.INTEGER(0, {
      menu: {
        entries: TEXT_TYPES.map((type, i) => {
          return {
            name: type,
            value: i
          };
        })
      }
    });
    this.size = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [true, false]
    });
    this.extrude = ParamConfig.FLOAT(0.1, {
      visible_if: {
        type: TEXT_TYPES.indexOf(TEXT_TYPE.MESH)
      }
    });
    this.segments = ParamConfig.INTEGER(1, {
      range: [1, 20],
      range_locked: [true, false],
      visible_if: {
        type: TEXT_TYPES.indexOf(TEXT_TYPE.MESH)
      }
    });
    this.stroke_width = ParamConfig.FLOAT(0.02, {
      visible_if: {
        type: TEXT_TYPES.indexOf(TEXT_TYPE.STROKE)
      }
    });
  }
}
const ParamsConfig2 = new TextSopParamsConfig();
export class TextSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._font_loader = new FontLoader2();
    this._loaded_fonts = {};
  }
  static type() {
    return "text";
  }
  initialize_node() {
  }
  async cook() {
    try {
      this._loaded_fonts[this.pv.font] = this._loaded_fonts[this.pv.font] || await this._load_url();
    } catch (err) {
      this.states.error.set(`count not load font (${this.pv.font})`);
      return;
    }
    const font = this._loaded_fonts[this.pv.font];
    if (font) {
      switch (TEXT_TYPES[this.pv.type]) {
        case TEXT_TYPE.MESH:
          return this._create_geometry_from_type_mesh(font);
        case TEXT_TYPE.FLAT:
          return this._create_geometry_from_type_flat(font);
        case TEXT_TYPE.LINE:
          return this._create_geometry_from_type_line(font);
        case TEXT_TYPE.STROKE:
          return this._create_geometry_from_type_stroke(font);
        default:
          console.warn("type is not valid");
      }
    }
  }
  _create_geometry_from_type_mesh(font) {
    const text = this.displayed_text();
    const parameters = {
      font,
      size: this.pv.size,
      height: this.pv.extrude,
      curveSegments: this.pv.segments
    };
    try {
      const geometry = new TextBufferGeometry2(text, parameters);
      if (!geometry.index) {
        const position_array = geometry.getAttribute("position").array;
        geometry.setIndex(lodash_range(position_array.length / 3));
      }
      this.set_geometry(geometry);
    } catch (err) {
      this.states.error.set(GENERATION_ERROR_MESSAGE);
    }
  }
  _create_geometry_from_type_flat(font) {
    const shapes = this._get_shapes(font);
    if (shapes) {
      var geometry = new ShapeBufferGeometry2(shapes);
      this.set_geometry(geometry);
    }
  }
  _create_geometry_from_type_line(font) {
    const shapes = this.shapes_from_font(font);
    if (shapes) {
      const positions = [];
      const indices = [];
      let current_index = 0;
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const points = shape.getPoints();
        for (let j = 0; j < points.length; j++) {
          const point = points[j];
          positions.push(point.x);
          positions.push(point.y);
          positions.push(0);
          indices.push(current_index);
          if (j > 0 && j < points.length - 1) {
            indices.push(current_index);
          }
          current_index += 1;
        }
      }
      const geometry = new BufferGeometry2();
      geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      this.set_geometry(geometry, ObjectType.LINE_SEGMENTS);
    }
  }
  async _create_geometry_from_type_stroke(font) {
    const shapes = this.shapes_from_font(font);
    if (shapes) {
      const loader = await this._load_svg_loader();
      if (!loader) {
        return;
      }
      var style = loader.getStrokeStyle(this.pv.stroke_width, "white", "miter", "butt", 4);
      const geometries = [];
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const points = shape.getPoints();
        const arcDivisions = 12;
        const minDistance = 1e-3;
        const geometry = loader.pointsToStroke(points, style, arcDivisions, minDistance);
        geometries.push(geometry);
      }
      const merged_geometry = BufferGeometryUtils2.mergeBufferGeometries(geometries);
      this.set_geometry(merged_geometry);
    }
  }
  shapes_from_font(font) {
    const shapes = this._get_shapes(font);
    if (shapes) {
      const holeShapes = [];
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.holes && shape.holes.length > 0) {
          for (let j = 0; j < shape.holes.length; j++) {
            const hole = shape.holes[j];
            holeShapes.push(hole);
          }
        }
      }
      shapes.push.apply(shapes, holeShapes);
      return shapes;
    }
  }
  _get_shapes(font) {
    const text = this.displayed_text();
    try {
      const shapes = font.generateShapes(text, this.pv.size);
      return shapes;
    } catch (err) {
      this.states.error.set(GENERATION_ERROR_MESSAGE);
    }
  }
  displayed_text() {
    return this.pv.text || "";
  }
  _load_url() {
    const url = `${this.pv.font}?${Date.now()}`;
    const ext = this.get_extension();
    switch (ext) {
      case "ttf": {
        return this._load_ttf(url);
      }
      case "json": {
        return this._load_json(url);
      }
      default: {
        return null;
      }
    }
  }
  async required_modules() {
    if (this.p.font.is_dirty) {
      await this.p.font.compute();
    }
    const ext = this.get_extension();
    switch (ext) {
      case "ttf": {
        return [ModuleName.TTFLoader];
      }
      case "json": {
        return [ModuleName.SVGLoader];
      }
    }
  }
  get_extension() {
    const url = this.pv.font;
    const elements1 = url.split("?")[0];
    const elements2 = elements1.split(".");
    return elements2[elements2.length - 1];
  }
  _load_ttf(url) {
    return new Promise(async (resolve, reject) => {
      const loaded_module = await this._load_ttf_loader();
      if (!loaded_module) {
        return;
      }
      loaded_module.load(url, (fnt) => {
        const parsed = this._font_loader.parse(fnt);
        resolve(parsed);
      }, void 0, () => {
        reject();
      });
    });
  }
  _load_json(url) {
    return new Promise((resolve, reject) => {
      this._font_loader.load(url, (font) => {
        resolve(font);
      }, void 0, () => {
        reject();
      });
    });
  }
  async _load_ttf_loader() {
    const module = await Poly2.instance().modulesRegister.module(ModuleName.TTFLoader);
    if (module) {
      return new module.TTFLoader();
    }
  }
  async _load_svg_loader() {
    const module = await Poly2.instance().modulesRegister.module(ModuleName.SVGLoader);
    if (module) {
      return module.SVGLoader;
    }
  }
}
