import mapboxgl from "mapbox-gl";
export declare class MapsRegister {
    private static _instance;
    static instance(): MapsRegister;
    _maps_by_id: Map<string, mapboxgl.Map>;
    register_map(id: string, map: mapboxgl.Map): void;
    deregister_map(id: string): void;
}
