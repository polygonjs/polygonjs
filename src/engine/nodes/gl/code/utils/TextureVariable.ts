import {TextureAllocation} from './TextureAllocation';
import {PolyScene} from '../../../../scene/PolyScene';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';
import {BaseGlNodeType} from '../../_Base';

export interface TextureVariableData {
	name: string;
	size: number;
	nodes: string[];
}

export class TextureVariable {
	private _allocation: TextureAllocation | undefined;
	private _position: number = -1;
	private _readonly = false;

	private _graph_node_ids: Map<CoreGraphNodeId, boolean> | undefined;

	constructor(private _name: string, private _size: number) {
		if (!_name) {
			throw 'TextureVariable requires a name';
		}
	}

	merge(variable: TextureVariable) {
		if (!variable.readonly()) {
			this.setReadonly(false);
		}

		variable.graphNodeIds()?.forEach((boolean, graph_node_id) => {
			this.addGraphNodeId(graph_node_id);
		});
	}

	setReadonly(state: boolean) {
		this._readonly = state;
	}
	readonly() {
		return this._readonly;
	}

	setAllocation(allocation: TextureAllocation) {
		this._allocation = allocation;
	}
	allocation() {
		return this._allocation;
	}

	graphNodeIds() {
		return this._graph_node_ids;
	}
	addGraphNodeId(id: CoreGraphNodeId) {
		this._graph_node_ids = this._graph_node_ids || new Map();
		this._graph_node_ids.set(id, true);
	}
	name() {
		return this._name;
	}
	size() {
		return this._size;
	}

	setPosition(position: number) {
		this._position = position;
	}
	position() {
		return this._position;
	}
	component(): string {
		return 'xyzw'.split('').splice(this._position, this._size).join('');
	}

	static fromJSON(data: TextureVariableData): TextureVariable {
		return new TextureVariable(data.name, data.size);
	}

	toJSON(scene: PolyScene): TextureVariableData {
		const names: string[] = [];
		if (this._graph_node_ids) {
			this._graph_node_ids.forEach((boolean, node_id) => {
				const node = scene.graph.nodeFromId(node_id) as BaseGlNodeType;
				if (node) {
					const name = node.fullPath();
					if (name) {
						names.push(name);
					}
				}
			});
		}

		return {
			name: this.name(),
			size: this.size(),
			nodes: names,
		};
	}
}
