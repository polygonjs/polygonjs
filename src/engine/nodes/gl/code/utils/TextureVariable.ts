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

	private _graphNodeIds: Set<CoreGraphNodeId> | undefined;

	constructor(private _name: string, private _size: number) {
		if (!_name) {
			throw 'TextureVariable requires a name';
		}
	}

	merge(variable: TextureVariable) {
		if (!variable.readonly()) {
			this.setReadonly(false);
		}

		variable.graphNodeIds()?.forEach((graphNodeId) => {
			this.addGraphNodeId(graphNodeId);
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
		return this._graphNodeIds;
	}
	addGraphNodeId(id: CoreGraphNodeId) {
		this._graphNodeIds = this._graphNodeIds || new Set();
		this._graphNodeIds.add(id);
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
		if (this._graphNodeIds) {
			this._graphNodeIds.forEach((graphNodeId) => {
				const node = scene.graph.nodeFromId(graphNodeId) as BaseGlNodeType;
				if (node) {
					const name = node.path();
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
