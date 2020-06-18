export declare class CoreGeometryOperationHexagon {
    private _param_size;
    private _param_hexagon_radius;
    private _param_points_only;
    constructor(_param_size: THREE.Vector2, _param_hexagon_radius: number, _param_points_only: boolean);
    process(): THREE.BufferGeometry;
}
