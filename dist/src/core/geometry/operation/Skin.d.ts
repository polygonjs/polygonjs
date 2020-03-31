import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare class CoreGeometryOperationSkin {
    private geometry;
    private geometry1;
    private geometry0;
    constructor(geometry: BufferGeometry, geometry1: BufferGeometry, geometry0: BufferGeometry);
    process(): void;
}
