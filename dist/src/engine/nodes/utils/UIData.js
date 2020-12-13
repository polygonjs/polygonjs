import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Color as Color2} from "three/src/math/Color";
import {NodeEvent as NodeEvent2} from "../../poly/NodeEvent";
const NODE_WIDTH_UNIT = 50;
export class UIData {
  constructor(node, x = 0, y = 0) {
    this.node = node;
    this._position = new Vector22();
    this._width = 50;
    this._color = new Color2(0.75, 0.75, 0.75);
    this._layout_vertical = true;
    this._json = {
      x: 0,
      y: 0
    };
    this._position.x = x;
    this._position.y = y;
  }
  width() {
    if (this._layout_vertical) {
      const available_inputs = this.node.io.inputs.max_inputs_count || 0;
      return Math.max(NODE_WIDTH_UNIT, NODE_WIDTH_UNIT * Math.ceil(available_inputs / 2));
    } else {
      return NODE_WIDTH_UNIT;
    }
  }
  set_comment(comment) {
    this._comment = comment;
    this.node.emit(NodeEvent2.UI_DATA_COMMENT_UPDATED);
  }
  get comment() {
    return this._comment;
  }
  set_color(color) {
    this._color = color;
  }
  color() {
    return this._color;
  }
  set_layout_horizontal() {
    this._layout_vertical = false;
  }
  is_layout_vertical() {
    return this._layout_vertical;
  }
  copy(ui_data) {
    this._position.copy(ui_data.position);
    this._color.copy(ui_data.color());
  }
  get position() {
    return this._position;
  }
  set_position(new_position, y = 0) {
    if (new_position instanceof Vector22) {
      this._position.copy(new_position);
    } else {
      const x = new_position;
      this._position.set(x, y);
    }
    this.node.emit(NodeEvent2.UI_DATA_POSITION_UPDATED);
  }
  translate(offset, snap = false) {
    this._position.add(offset);
    if (snap) {
      this._position.x = Math.round(this._position.x);
      this._position.y = Math.round(this._position.y);
    }
    this.node.emit(NodeEvent2.UI_DATA_POSITION_UPDATED);
  }
  to_json() {
    this._json.x = this._position.x;
    this._json.y = this._position.y;
    this._json.comment = this._comment;
    return this._json;
  }
}
