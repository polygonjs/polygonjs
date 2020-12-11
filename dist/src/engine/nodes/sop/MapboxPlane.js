import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Box2 as Box22} from "three/src/math/Box2";
import mapboxgl from "mapbox-gl";
import {CoreObject} from "../../../core/geometry/Object";
import {ObjectType} from "../../../core/geometry/Constant";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {CoreMath} from "../../../core/math/_Module";
import {MapboxListenerParamConfig, MapboxListenerSopNode} from "./utils/mapbox/MapboxListener";
import {CoreMapboxTransform} from "../../../core/mapbox/Transform";
const SCALE_ATTRIB_NAME = "scale";
const NORMAL_ATTRIB_NAME = "normal";
const R_MAT_MAPBOX = new Matrix42().makeRotationAxis(new Vector32(1, 0, 0), -Math.PI * 0.5);
const R_MAT_WORLD = new Matrix42().makeRotationAxis(new Vector32(1, 0, 0), Math.PI * 0.5);
var MapboxPlaneType;
(function(MapboxPlaneType2) {
  MapboxPlaneType2["PLANE"] = "plane";
  MapboxPlaneType2["HEXAGONS"] = "hexagon";
})(MapboxPlaneType || (MapboxPlaneType = {}));
const MAPBOX_PLANE_TYPES = [MapboxPlaneType.PLANE, MapboxPlaneType.HEXAGONS];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {MapboxPlaneHexagonsController} from "./utils/mapbox/mapbox_plane/HexagonsController";
class MapboxPlaneSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
  constructor() {
    super(...arguments);
    this.type = ParamConfig.INTEGER(0, {
      menu: {
        entries: MAPBOX_PLANE_TYPES.map((name, i) => {
          return {name, value: i};
        })
      }
    });
    this.resolution = ParamConfig.INTEGER(10, {
      range: [1, 20],
      range_locked: [true, false]
    });
    this.size_mult = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [true, false]
    });
    this.full_view = ParamConfig.BOOLEAN(1);
    this.as_points = ParamConfig.BOOLEAN(0, {
      visible_if: {
        type: MAPBOX_PLANE_TYPES.indexOf(MapboxPlaneType.PLANE)
      }
    });
    this.mapbox_transform = ParamConfig.BOOLEAN(1);
  }
}
const ParamsConfig2 = new MapboxPlaneSopParamsConfig();
export class MapboxPlaneSopNode extends MapboxListenerSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._hexagons_controller = new MapboxPlaneHexagonsController(this);
  }
  static type() {
    return "mapbox_plane";
  }
  cook() {
    this._mapbox_listener.cook();
  }
  _post_init_controller() {
    const geometry = this._build_plane();
    if (geometry) {
      let type = ObjectType.MESH;
      if (this.pv.as_points || this._as_hexagons()) {
        type = ObjectType.POINTS;
      }
      const object = this.create_object(geometry, type);
      const core_object = new CoreObject(object, 0);
      core_object.add_attribute("mapbox_sw", this.pv.south_west);
      core_object.add_attribute("mapbox_ne", this.pv.north_east);
      this.set_object(object);
    }
  }
  _build_plane() {
    if (!this._camera_node) {
      return;
    }
    const map_center = this._camera_node.center();
    if (!map_center) {
      this.states.error.set("map is not yet loaded");
      return;
    }
    const transformer = new CoreMapboxTransform(this._camera_node);
    const mapbox_center_3d = new Vector32(map_center.lng, 0, map_center.lat);
    transformer.transform_position_FINAL(mapbox_center_3d);
    const mapbox_center = new Vector22(mapbox_center_3d.x, mapbox_center_3d.z);
    const vertical_far_lng_lat_points = this._camera_node.vertical_far_lng_lat_points();
    const vertical_near_lng_lat_points = this._camera_node.vertical_near_lng_lat_points();
    const lng_lat_points = this.pv.full_view ? vertical_far_lng_lat_points : vertical_near_lng_lat_points;
    if (!lng_lat_points) {
      return;
    }
    const mirrored_near_lng_lat_points = lng_lat_points.map((p) => this._mirror_lng_lat(p, map_center));
    lng_lat_points.push(map_center);
    mirrored_near_lng_lat_points.forEach((p) => {
      lng_lat_points.push(p);
    });
    const box = new Box22();
    for (let p of lng_lat_points) {
      box.expandByPoint(new Vector22(p.lng, p.lat));
    }
    const mapbox_box = new Box22();
    for (let p of lng_lat_points) {
      const pt3d = new Vector32(p.lng, 0, p.lat);
      transformer.transform_position_FINAL(pt3d);
      mapbox_box.expandByPoint(new Vector22(pt3d.x, pt3d.z));
    }
    const mapbox_dimensions = new Vector22();
    mapbox_box.getSize(mapbox_dimensions);
    const horizontal_lng_lat_points = this._camera_node.horizontal_lng_lat_points();
    if (!horizontal_lng_lat_points) {
      return;
    }
    const mapbox_horizontal_lng_lat_points = horizontal_lng_lat_points.map((p) => {
      const pt3d = new Vector32(p.lng, 0, p.lat);
      transformer.transform_position_FINAL(pt3d);
      return {lng: pt3d.x, lat: pt3d.z};
    });
    const mapbox_horizontal_distances = {
      lng: Math.abs(mapbox_horizontal_lng_lat_points[0].lng - mapbox_horizontal_lng_lat_points[1].lng),
      lat: Math.abs(mapbox_horizontal_lng_lat_points[0].lat - mapbox_horizontal_lng_lat_points[1].lat)
    };
    const mapbox_horizontal_distance = Math.sqrt(mapbox_horizontal_distances.lng * mapbox_horizontal_distances.lng + mapbox_horizontal_distances.lat * mapbox_horizontal_distances.lat);
    const mapbox_segment_size = mapbox_horizontal_distance / this.pv.resolution;
    const segments_counts = {
      x: CoreMath.highest_even(this.pv.size_mult * Math.ceil(mapbox_dimensions.x / mapbox_segment_size)),
      y: CoreMath.highest_even(this.pv.size_mult * Math.ceil(mapbox_dimensions.y / mapbox_segment_size))
    };
    mapbox_dimensions.x = segments_counts.x * mapbox_segment_size;
    mapbox_dimensions.y = segments_counts.y * mapbox_segment_size;
    const mapbox_box_untransformed = new Box22();
    const mapbox_corners = [
      mapbox_center.clone().sub(mapbox_dimensions.clone().multiplyScalar(0.5)),
      mapbox_center.clone().sub(mapbox_dimensions.clone().multiplyScalar(-0.5)),
      mapbox_center.clone().add(mapbox_dimensions.clone().multiplyScalar(0.5)),
      mapbox_center.clone().add(mapbox_dimensions.clone().multiplyScalar(-0.5))
    ];
    mapbox_corners.forEach((p) => {
      const untransformed_3d = transformer.untransform_position_FINAL(new Vector32(p.x, 0, p.y));
      const untransformed = new Vector22(untransformed_3d.x, untransformed_3d.z);
      mapbox_box_untransformed.expandByPoint(untransformed);
    });
    const world_dimensions = new Vector22();
    mapbox_box_untransformed.getSize(world_dimensions);
    const world_plane_center = new Vector22(map_center.lng, map_center.lat);
    const horizontal_scale = mapbox_dimensions.x / segments_counts.x;
    let core_geo;
    const plane_dimensions = this.pv.mapbox_transform ? mapbox_dimensions : world_dimensions;
    const rotation_matrix = this.pv.mapbox_transform ? R_MAT_MAPBOX : R_MAT_WORLD;
    const geometry_center = this.pv.mapbox_transform ? mapbox_center : world_plane_center;
    let geometry;
    if (this._as_hexagons()) {
      geometry = this._hexagons_controller.geometry(plane_dimensions, segments_counts);
    } else {
      geometry = new PlaneBufferGeometry2(plane_dimensions.x, plane_dimensions.y, segments_counts.x, segments_counts.y);
    }
    geometry.applyMatrix4(rotation_matrix);
    geometry.translate(geometry_center.x, 0, geometry_center.y);
    core_geo = new CoreGeometry(geometry);
    const z_scale = [horizontal_scale, 1][0];
    const scale = [horizontal_scale, horizontal_scale, z_scale];
    core_geo.add_numeric_attrib(SCALE_ATTRIB_NAME, 3, scale);
    core_geo.add_numeric_attrib(NORMAL_ATTRIB_NAME, 3, [0, 1, 0]);
    return geometry;
  }
  _mirror_lng_lat(p, map_center) {
    const delta = {
      lng: map_center.lng - p.lng,
      lat: map_center.lat - p.lat
    };
    return new mapboxgl.LngLat(map_center.lng + delta.lng, map_center.lat + delta.lat);
  }
  _as_hexagons() {
    return this.pv.type == MAPBOX_PLANE_TYPES.indexOf(MapboxPlaneType.HEXAGONS);
  }
}
