import {TextureAllocation} from './TextureAllocation';
import {PolyScene} from 'src/engine/scene/PolyScene';

export interface TextureVariableData {
	name: string;
	nodes: string[];
}

export class TextureVariable {
	private _allocation: TextureAllocation | undefined;
	private _position: number = -1;

	private _graph_node_ids: Map<string, boolean> | undefined;

	constructor(private _name: string, private _size: number) {
		if (!_name) {
			throw 'TextureVariable requires a name';
		}
	}

	set_allocation(allocation: TextureAllocation) {
		this._allocation = allocation;
	}
	get allocation() {
		return this._allocation;
	}

	get graph_node_ids() {
		return this._graph_node_ids;
	}
	add_graph_node_id(id: string) {
		this._graph_node_ids = this._graph_node_ids || new Map();
		this._graph_node_ids.set(id, true);
	}
	get name() {
		return this._name;
	}
	get size() {
		return this._size;
	}

	set_position(position: number) {
		this._position = position;
	}
	get position() {
		return this._position;
	}
	get component(): string {
		return 'xyzw'
			.split('')
			.splice(this._position, this._size)
			.join('');
	}
	to_json(scene: PolyScene): TextureVariableData {
		const names: string[] = [];
		if (this._graph_node_ids) {
			this._graph_node_ids.forEach((boolean, node_id: string) => {
				const name = scene.graph.node_from_id(node_id).name;
				names.push(name);
			});
		}

		return {
			name: this.name,
			nodes: names.sort(),
		};
	}
}
