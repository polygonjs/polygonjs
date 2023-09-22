import {NodeEvent} from '../../../poly/NodeEvent';
import {NodeContext} from '../../../poly/NodeContext';
import {ConnectionPointTypeMap} from './connections/ConnectionMap';
import {TypedNode} from '../../_Base';
import {CoreType} from '../../../../core/Type';
import {arrayUniq} from '../../../../core/ArrayUtils';
import {TypedNodeConnection} from './NodeConnection';

const _usedOutputIndices: number[] = [];

export class OutputsController<NC extends NodeContext> {
	private _has_outputs: boolean = false;
	private _named_output_connection_points: ConnectionPointTypeMap[NC][] | undefined;
	private _has_named_outputs: boolean = false;
	private _connections: TypedNodeConnection<NC>[] = [];

	constructor(private node: TypedNode<NC, any>) {
		this.node.scene().timeController.onPlayingStateChange(this._onPlayingStateChangeBound);
	}

	private _onPlayingStateChangeBound = this._onPlayingStateChange.bind(this);
	private _onPlayingStateChange() {
		this._clearCache();
	}
	private _outputIndexCache: Map<number | string, number> = new Map();
	private _clearCache() {
		this._outputIndexCache.clear();
	}

	dispose() {
		this.node.scene().timeController.removeOnPlayingStateChange(this._onPlayingStateChangeBound);
		if (this._named_output_connection_points) {
			this._named_output_connection_points.splice(0, this._named_output_connection_points.length);
		}
	}

	setHasOneOutput() {
		this._has_outputs = true;
	}
	setHasNoOutput() {
		this._has_outputs = false;
	}

	hasOutputs() {
		return this._has_outputs;
	}
	hasNamedOutputs() {
		return this._has_named_outputs;
	}
	hasNamedOutput(name: string): boolean {
		return this.getNamedOutputIndex(name) >= 0;
	}
	namedOutputConnectionPoints(): Readonly<ConnectionPointTypeMap[NC][]> | undefined {
		return this._named_output_connection_points;
	}
	namedOutputConnection(index: number): Readonly<ConnectionPointTypeMap[NC]> | undefined {
		if (this._named_output_connection_points) {
			return this._named_output_connection_points[index];
		}
	}

	getNamedOutputIndex(name: string): number {
		if (this._named_output_connection_points) {
			let i = 0;
			for (const connectionPoint of this._named_output_connection_points) {
				if (connectionPoint && connectionPoint.name() == name) {
					return i;
				}
				i++;
			}
		}
		return -1;
	}
	getOutputIndex(output_index_or_name: number | string): number {
		let currentCache = this._outputIndexCache.get(output_index_or_name);
		if (currentCache == null) {
			currentCache = this._getOutputIndex(output_index_or_name);
			this._outputIndexCache.set(output_index_or_name, currentCache);
		}
		return currentCache;
	}
	private _getOutputIndex(output_index_or_name: number | string): number {
		if (output_index_or_name != null) {
			if (CoreType.isString(output_index_or_name)) {
				if (this.hasNamedOutputs()) {
					return this.getNamedOutputIndex(output_index_or_name);
				} else {
					console.warn(`node ${this.node.path()} has no named outputs`);
					return -1;
				}
			} else {
				return output_index_or_name;
			}
		}
		return -1;
	}

	namedOutputConnectionPointsByName(name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this._named_output_connection_points) {
			for (const connection_point of this._named_output_connection_points) {
				if (connection_point?.name() == name) {
					return connection_point;
				}
			}
		}
	}

	setNamedOutputConnectionPoints(connection_points: ConnectionPointTypeMap[NC][], set_dirty: boolean = true) {
		this._has_named_outputs = true;

		this.node.io.connections.outputConnections(this._connections);
		for (const connection of this._connections) {
			if (connection) {
				// assume we only work with indices for now, not with connection point names
				// so we only need to check again the new max number of connection points.
				if (connection.outputIndex() >= connection_points.length) {
					connection.disconnect({setInput: true});
				}
			}
		}

		// update connections
		this._named_output_connection_points = connection_points;
		if (set_dirty && this.node.scene()) {
			// why do I need this set dirty here?
			// I currently have to have a flag to optionally prevent this,
			// for instance from gl nodes which have their outputs updated in a post dirty hook
			this.node.setDirty(this.node);
		}
		this.node.emit(NodeEvent.NAMED_OUTPUTS_UPDATED);
	}
	used_output_names(): string[] {
		// target.length = 0;
		const target: string[] = [];
		const connectionsController = this.node.io.connections;
		if (connectionsController) {
			connectionsController.outputConnections(this._connections);
			const outputIndices = arrayUniq(
				this._connections.map((connection) => (connection ? connection.outputIndex() : null))
			);
			// outputIndices = arrayUniq(output_indices);
			// const used_output_indices: number[] = [];
			_usedOutputIndices.length = 0;
			outputIndices.forEach((index) => {
				if (CoreType.isNumber(index)) {
					_usedOutputIndices.push(index);
				}
			});
			// const used_output_names: string[] = [];
			const connectionPoints = this.namedOutputConnectionPoints();
			if (connectionPoints) {
				for (const index of _usedOutputIndices) {
					const name = connectionPoints[index]?.name();
					if (name) {
						target.push(name);
					}
				}
			}
		}
		return target;
	}
}
