import { Object3D } from 'three/src/core/Object3D';
import { LineSegments } from 'three/src/objects/LineSegments';
import { BaseSopNodeType } from '../../engine/nodes/sop/_Base';
import { CoordinatesCollection } from './CoordinatesCollection';
export declare class FeatureConverter {
    private node;
    private name;
    private features;
    id: number | undefined;
    constructor(node: BaseSopNodeType, name: string, features: any[]);
    create_object(): Object3D | undefined;
    _create_line(coordinates_collection: CoordinatesCollection): LineSegments;
    private _create_all_coordinates_collections;
    private _create_coordinates;
}
