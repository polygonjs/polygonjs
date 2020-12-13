import lodash_times from "lodash/times";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {CoreGeometry} from "../geometry/Geometry";
import {ObjectType} from "../geometry/Constant";
import {CoreString} from "../String";
import lodash_sum from "lodash/sum";
import {CoordinatesCollection as CoordinatesCollection2} from "./CoordinatesCollection";
const MULTILINESTRING = "MultiLineString";
const LINESTRING = "LineString";
export class FeatureConverter {
  constructor(node, name, features) {
    this.node = node;
    this.name = name;
    this.features = features;
  }
  create_object() {
    const coordinates_collections = this._create_all_coordinates_collections();
    const perimeter = lodash_sum(coordinates_collections.map((f) => f.perimeter()));
    const sorted_features = CoordinatesCollection2.sort(coordinates_collections);
    const lines = sorted_features.map((feature) => {
      return this._create_line(feature);
    });
    lines.forEach((line) => {
      const geometry = line.geometry;
      const geo_wrapper2 = new CoreGeometry(geometry);
      geo_wrapper2.add_numeric_attrib("perimeter", 1, perimeter);
    });
    const geometries = lines.map((l) => l.geometry);
    const merged_geometry = CoreGeometry.merge_geometries(geometries);
    if (!merged_geometry) {
      return;
    }
    const geo_wrapper = new CoreGeometry(merged_geometry);
    geo_wrapper.add_numeric_attrib("pti", 1, 0);
    const points = geo_wrapper.points();
    const points_count = points.length;
    points.forEach((point, i) => {
      const pti = i / (points_count - 1);
      point.set_attrib_value("pti", pti);
    });
    const merged_object = this.node.create_object(merged_geometry, ObjectType.LINE_SEGMENTS);
    return merged_object;
  }
  _create_line(coordinates_collection) {
    const points_count = coordinates_collection.coordinates.length;
    const positions = [];
    const indices = [];
    lodash_times(points_count, (i) => {
      const coordinates = coordinates_collection.coordinates[i];
      positions.push(coordinates.x);
      positions.push(0);
      positions.push(coordinates.y);
      if (i > 0) {
        indices.push(i - 1);
        indices.push(i);
      }
    });
    const geometry = new BufferGeometry2();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    const object = this.node.create_object(geometry, ObjectType.LINE_SEGMENTS);
    const geo_wrapper = new CoreGeometry(geometry);
    const id_from_name = CoreString.to_id(this.name) % 1e7;
    geo_wrapper.add_numeric_attrib("id", 1, this.id);
    geo_wrapper.add_numeric_attrib("name_id", 1, id_from_name);
    return object;
  }
  _create_all_coordinates_collections() {
    const coordinates_collections = [];
    this.features.forEach((feature) => {
      this.id = this.id || feature["id"];
      const feature_geometry = feature.geometry;
      if (feature_geometry) {
        const type = feature_geometry["type"];
        switch (type) {
          case MULTILINESTRING:
            const multi_coordinates = feature_geometry["coordinates"];
            if (multi_coordinates) {
              lodash_times(multi_coordinates.length, (i) => {
                const coordinates = multi_coordinates[i];
                coordinates_collections.push(this._create_coordinates(coordinates));
              });
            }
            break;
          case LINESTRING:
            coordinates_collections.push(this._create_coordinates(feature_geometry["coordinates"]));
            break;
          default:
            console.warn(`type ${type} not taken into account`);
        }
      }
    });
    return coordinates_collections;
  }
  _create_coordinates(raw_coordinates) {
    const vectors = raw_coordinates.map((raw_coordinate) => {
      return new Vector22(raw_coordinate[0], raw_coordinate[1]);
    });
    return new CoordinatesCollection2(vectors);
  }
}
