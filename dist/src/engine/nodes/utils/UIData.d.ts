import { Vector2 } from 'three/src/math/Vector2';
import { Color } from 'three/src/math/Color';
import { BaseNodeType } from '../_Base';
export interface NodeUIDataJson {
    x: number;
    y: number;
    comment?: string;
}
export declare class UIData {
    private node;
    private _position;
    private _width;
    private _border_radius;
    private _color;
    private _layout_vertical;
    private _comment;
    private _json;
    constructor(node: BaseNodeType, x?: number, y?: number);
    set_border_radius(radius: number): void;
    border_radius(): number;
    set_width(width: number): void;
    width(): number;
    set_comment(comment: string | undefined): void;
    get comment(): string | undefined;
    set_color(color: Color): void;
    color(): Color;
    set_layout_horizontal(): void;
    is_layout_vertical(): boolean;
    copy(ui_data: UIData): void;
    get position(): Vector2;
    set_position(new_position: Vector2 | number, y?: number): void;
    translate(offset: Vector2, snap?: boolean): void;
    to_json(): NodeUIDataJson;
}
