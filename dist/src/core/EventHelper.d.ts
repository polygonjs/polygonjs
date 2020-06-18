import { Vector2 } from 'three/src/math/Vector2';
export declare class EventHelper {
    private element;
    constructor(element: HTMLElement);
    set_element(element: HTMLElement): void;
    static element_position(event: MouseEvent | TouchEvent, element: HTMLElement, position: Vector2): void;
    static normalized_position(event: MouseEvent, element: HTMLElement, position: Vector2): void;
    static normalized_position_0_1(event: MouseEvent, element: HTMLElement, position: Vector2): void;
    element_position(event: MouseEvent, position: Vector2): void;
    normalized_position(event: MouseEvent, position: Vector2): void;
}
