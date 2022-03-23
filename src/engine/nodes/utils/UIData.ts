import {Vector2} from 'three/src/math/Vector2';
import {Color} from 'three/src/math/Color';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';
import {CoreType} from '../../../core/Type';

export interface NodeUIDataJson {
	x: number;
	y: number;
	comment?: string;
}

export class UIData {
	private _position: Vector2 = new Vector2();
	protected _width: number = 50;
	// private _border_radius: number = 3;
	private _color: Color = new Color(0.75, 0.75, 0.75);
	// private _icon: string | null = null;
	private _layoutVertical: boolean = true;
	private _comment: string | undefined;
	private _json: NodeUIDataJson = {
		x: 0,
		y: 0,
	};

	constructor(private node: BaseNodeType, x: number = 0, y: number = 0) {
		this._position.x = x;
		this._position.y = y;
	}
	dispose() {
		this._comment = undefined;
	}

	setComment(comment: string | undefined) {
		this._comment = comment;
		this.node.emit(NodeEvent.UI_DATA_COMMENT_UPDATED);
	}
	comment(): string | undefined {
		return this._comment;
	}
	setColor(color: Color) {
		this._color = color;
	}
	color() {
		return this._color;
	}
	// setIcon(icon: string) {
	// 	this._icon = icon;
	// }
	// icon() {
	// 	return this._icon;
	// }
	setLayoutHorizontal() {
		this._layoutVertical = false;
	}
	isLayoutVertical() {
		return this._layoutVertical;
	}

	copy(ui_data: UIData) {
		this._position.copy(ui_data.position());
		this._color.copy(ui_data.color());
	}

	position() {
		return this._position;
	}

	setPosition(newPosition: Vector2 | number, y: number = 0) {
		if (CoreType.isNumber(newPosition)) {
			const x = newPosition;
			this._position.set(x, y);
		} else {
			this._position.copy(newPosition);
		}
		this.node.emit(NodeEvent.UI_DATA_POSITION_UPDATED);
		return this;
	}

	translate(offset: Vector2, snap: boolean = false) {
		this._position.add(offset);

		if (snap) {
			this._position.x = Math.round(this._position.x);
			this._position.y = Math.round(this._position.y);
		}

		this.node.emit(NodeEvent.UI_DATA_POSITION_UPDATED);
		return this;
	}

	toJSON(): NodeUIDataJson {
		this._json.x = this._position.x;
		this._json.y = this._position.y;
		this._json.comment = this._comment;
		return this._json;
	}
}
