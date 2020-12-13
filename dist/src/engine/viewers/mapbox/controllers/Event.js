export class MapboxViewerEventsController {
  constructor(_viewer) {
    this._viewer = _viewer;
  }
  init_events() {
    const map = this._viewer.map;
    if (!map) {
      return;
    }
    map.on("move", this._on_move.bind(this));
    map.on("moveend", this._on_moveend.bind(this));
    map.on("mousemove", this._on_mousemove.bind(this));
    map.on("mousedown", this._on_mousedown.bind(this));
    map.on("mouseup", this._on_mouseup.bind(this));
  }
  _on_move(e) {
  }
  _on_moveend(e) {
    this.camera_node_move_end();
  }
  _on_mousemove(e) {
  }
  _on_mousedown(e) {
  }
  _on_mouseup(e) {
  }
  camera_node_move_end() {
    this._viewer.camera_node?.on_move_end(this._viewer.canvas_container);
  }
}
