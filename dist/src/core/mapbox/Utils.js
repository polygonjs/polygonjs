import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {CoreMapboxConstants} from "./Constants";
const Constants2 = CoreMapboxConstants;
export class CoreMapboxUtils {
  static makePerspectiveMatrix(fovy, aspect, near, far) {
    const out = new Matrix42();
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    const newMatrix = [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      -1,
      0,
      0,
      2 * far * near * nf,
      0
    ];
    out.elements = newMatrix;
    return out;
  }
  static projectToWorld(lnglat) {
    const projected = [
      -Constants2.MERCATOR_A * lnglat[0] * Constants2.DEG2RAD * Constants2.PROJECTION_WORLD_SIZE,
      -Constants2.MERCATOR_A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * lnglat[1] * Constants2.DEG2RAD)) * Constants2.PROJECTION_WORLD_SIZE
    ];
    const pixelsPerMeter = this.projectedUnitsPerMeter(lnglat[1]);
    let height = lnglat[2];
    if (height == null) {
      height = 0;
    }
    projected.push(height * pixelsPerMeter);
    return new Vector32(projected[0], projected[1], projected[2]);
  }
  static projectedUnitsPerMeter(latitude) {
    return Math.abs(Constants2.WORLD_SIZE * (1 / Math.cos(latitude * Math.PI / 180)) / Constants2.EARTH_CIRCUMFERENCE);
  }
  static fromLL(lon, lat) {
    const extent = 2003750834e-2;
    const x = lon * extent / 180;
    let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * extent / 180;
    return [(x + extent) / (2 * extent), 1 - (y + extent) / (2 * extent)];
  }
  static fromLLv(position) {
    const ll = this.fromLL(position.x, position.z);
    return new Vector32(ll[0], position.y, ll[1]);
  }
  static get_distance(latlng1, latlng2) {
    const R = 6371e3;
    const rad = Math.PI / 180, lat1 = latlng1.lat * rad, lat2 = latlng2.lat * rad, a = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
    const maxMeters = R * Math.acos(Math.min(a, 1));
    return maxMeters;
  }
  static lnglat_to_tile_number(lng_deg, lat_deg, zoom) {
    const lat_rad = lat_deg / 180 * Math.PI;
    const n = 2 ** zoom;
    const x = Math.floor((lng_deg + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2 * n);
    return {
      x,
      y
    };
  }
  static tile_number_to_lnglat(xtile, ytile, zoom) {
    const n = 2 ** zoom;
    const lon_deg = xtile / n * 360 - 180;
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)));
    const lat_deg = 180 * (lat_rad / Math.PI);
    return {
      lat: lat_deg,
      lng: lon_deg
    };
  }
}
