import CoreUIData from 'src/core/UIData';
import {Vector2} from 'three/src/math/Vector2';
import {Color} from 'three/src/math/Color';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

export interface NodeUIDataJson {
	x: number;
	y: number;
	comment?: string;
}

export class UIData extends CoreUIData {
	private _position: Vector2 = new Vector2();
	private _width: number = 50;
	private _border_radius: number = 3;
	private _color: Color = new Color(0.75, 0.75, 0.75);
	private _icon: string | null = null;
	private _layout_vertical: boolean = true;
	private _comment: string | undefined;

	constructor(private node: BaseNodeType, x: number = 0, y: number = 0) {
		super();
		this._position.x = x;
		this._position.y = y;
	}

	set_border_radius(radius: number) {
		this._border_radius = radius;
	}
	border_radius() {
		return this._border_radius;
	}
	set_width(width: number) {
		this._width = width;
	}
	width() {
		return this._width;
	}
	set_comment(comment: string) {
		this._comment = comment;
		this.node.emit(NodeEvent.UI_DATA_UPDATED, this.to_json());
	}
	comment(): string | undefined {
		return this._comment;
	}
	set_color(color: Color) {
		this._color = color;
	}
	color() {
		return this._color;
	}
	set_icon(icon: string) {
		this._icon = icon;
	}
	icon() {
		return this._icon;
	}
	set_layout_horizontal() {
		this._layout_vertical = false;
	}
	is_layout_vertical() {
		return this._layout_vertical;
	}

	copy(ui_data: UIData) {
		this._position.copy(ui_data.position());
		this._color.copy(ui_data.color());
	}

	position() {
		return this._position;
	}

	set_position(new_position: Vector2) {
		this._position.copy(new_position);
		this.node.emit(NodeEvent.UI_DATA_UPDATED, this.to_json());
	}

	translate(offset: Vector2, snap: boolean = false) {
		this._position.add(offset);

		if (snap) {
			this._position.x = Math.round(this._position.x);
			this._position.y = Math.round(this._position.y);
		}

		this.node.emit(NodeEvent.UI_DATA_UPDATED, this.to_json());
	}
	// arguments_to_vector(x: number,y: number){
	// 	if (arguments.length === 2) {
	// 		this._position.x = arguments[0];
	// 		this._position.y = arguments[1];
	// 	} else {
	// 		this._position.x = new_position.x;
	// 		this._position.y = new_position.y;
	// 	}
	// }
	to_json(): NodeUIDataJson {
		return {
			x: this._position.x,
			y: this._position.y,
			comment: this._comment,
		};
	}
}
