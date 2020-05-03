import { TextureAllocation } from './TextureAllocation';
import { PolyScene } from '../../../../scene/PolyScene';
export interface TextureVariableData {
    name: string;
    nodes: string[];
}
export declare class TextureVariable {
    private _name;
    private _size;
    private _allocation;
    private _position;
    private _graph_node_ids;
    constructor(_name: string, _size: number);
    set_allocation(allocation: TextureAllocation): void;
    get allocation(): TextureAllocation | undefined;
    get graph_node_ids(): Map<string, boolean> | undefined;
    add_graph_node_id(id: string): void;
    get name(): string;
    get size(): number;
    set_position(position: number): void;
    get position(): number;
    get component(): string;
    to_json(scene: PolyScene): TextureVariableData;
}
