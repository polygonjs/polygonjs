import { Vector3 } from "three/src/math/Vector3";
import { Matrix4 } from "three/src/math/Matrix4";
import mapboxgl from "mapbox-gl";
export declare class CoreMapboxUtils {
    static makePerspectiveMatrix(fovy: number, aspect: number, near: number, far: number): Matrix4;
    static projectToWorld(lnglat: Number3): Vector3;
    static projectedUnitsPerMeter(latitude: number): number;
    static fromLL(lon: number, lat: number): [number, number];
    static fromLLv(position: Vector3): Vector3;
    static get_distance(latlng1: mapboxgl.LngLat, latlng2: mapboxgl.LngLat): number;
    static lnglat_to_tile_number(lng_deg: number, lat_deg: number, zoom: number): {
        x: number;
        y: number;
    };
    static tile_number_to_lnglat(xtile: number, ytile: number, zoom: number): {
        lat: number;
        lng: number;
    };
}
