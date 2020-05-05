import mapboxgl from "mapbox-gl";

export class MapsRegister {
	private static _instance: MapsRegister;
	static instance() {
		return (this._instance = this._instance || new MapsRegister());
	}
	_maps_by_id: Map<string, mapboxgl.Map> = new Map();

	register_map(id: string, map: mapboxgl.Map) {
		this._maps_by_id.set(id, map);
	}
	deregister_map(id: string) {
		this._maps_by_id.delete(id);
	}
}
