export class MapsRegister {
  constructor() {
    this._maps_by_id = new Map();
  }
  static instance() {
    return this._instance = this._instance || new MapsRegister();
  }
  register_map(id, map) {
    this._maps_by_id.set(id, map);
  }
  deregister_map(id) {
    this._maps_by_id.delete(id);
  }
}
