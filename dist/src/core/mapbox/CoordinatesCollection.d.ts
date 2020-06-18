import { Vector2 } from "three/src/math/Vector2";
export declare class CoordinatesCollection {
    coordinates: Vector2[];
    constructor(coordinates: Vector2[]);
    first(): Vector2;
    last(): Vector2;
    distance_to(features_coordinates: CoordinatesCollection): number;
    next_id(features_coordinates_array: CoordinatesCollection[]): number;
    perimeter(): number;
    static sort(features_coordinates_array: CoordinatesCollection[]): CoordinatesCollection[];
}
