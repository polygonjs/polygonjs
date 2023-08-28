// import {pushOnArrayAtEntry} from '../MapUtils';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {WFCTileSide, WFCConnection, sortTileIds, SortedTileIds, ALL_SIDES} from './WFCCommon';
import {validConnectionObject, wfcConnectionFromObject} from './WFCConnection';
import {filterTileObjects, filterConnectionObjects} from './WFCUtils';
import {Object3D} from 'three';

const _sortedTileIds: SortedTileIds = {
	first: '',
	second: '',
};
type TraverseConnectionsCallback = (id0: string, id1: string, side0: WFCTileSide, side1: WFCTileSide) => void;
type TraverseUnconnectedSidesCallback = (side: WFCTileSide[]) => void;

type ConnectionsByTileId = Map<string, Map<string, Map<WFCTileSide, Set<WFCTileSide>>>>;
function _addConnection(connection: WFCConnection, connectionsByTileId: ConnectionsByTileId, invert: boolean) {
	sortTileIds(connection.id0, connection.id1, _sortedTileIds, invert);
	let mapForId0 = connectionsByTileId.get(_sortedTileIds.first);
	if (!mapForId0) {
		mapForId0 = new Map();
		connectionsByTileId.set(_sortedTileIds.first, mapForId0);
	}
	let sides = mapForId0.get(_sortedTileIds.second);
	if (!sides) {
		sides = new Map();
		mapForId0.set(_sortedTileIds.second, sides);
	}
	let inverted = connection.id0 != _sortedTileIds.first;
	const _side0 = inverted ? connection.side1 : connection.side0;
	const _side1 = inverted ? connection.side0 : connection.side1;
	const side0s = _side0.split('') as WFCTileSide[];
	const side1s = _side1.split('') as WFCTileSide[];
	for (const side0 of side0s) {
		for (const side1 of side1s) {
			let side1s = sides.get(side0);
			if (!side1s) {
				side1s = new Set();
				sides.set(side0, side1s);
			}
			if (!side1s.has(side1)) {
				side1s.add(side1);
			}
		}
	}
}
export class WFCTilesCollection {
	private _tiles: Object3D[];
	private _tilesById: Map<string, Object3D>;
	private _connectionsByTileId: ConnectionsByTileId = new Map();
	private _errorTileObject: Object3D | null;
	private _unresolvedTileObject: Object3D | null;
	constructor(objects: Object3D[]) {
		this._tiles = filterTileObjects(objects);
		this._errorTileObject = objects.find((o) => CoreWFCTileAttribute.getIsErrorTile(o)) || null;
		this._unresolvedTileObject = objects.find((o) => CoreWFCTileAttribute.getIsUnresolvedTile(o)) || null;
		this._tilesById = new Map();
		for (let tile of this._tiles) {
			this._tilesById.set(CoreWFCTileAttribute.getTileId(tile), tile);
		}

		const connectionObjects = filterConnectionObjects(objects);
		const connections = connectionObjects.filter(validConnectionObject).map(wfcConnectionFromObject);

		for (const connection of connections) {
			sortTileIds(connection.id0, connection.id1, _sortedTileIds);
			_addConnection(connection, this._connectionsByTileId, false);
			_addConnection(connection, this._connectionsByTileId, true);
		}
	}
	tiles() {
		return this._tiles;
	}
	tile(tileId: string) {
		return this._tilesById.get(tileId);
	}
	errorTile() {
		return this._errorTileObject;
	}
	unresolvedTile() {
		return this._unresolvedTileObject;
	}
	traverseConnections(id0: string, id1: string, callback: TraverseConnectionsCallback): void {
		sortTileIds(id0, id1, _sortedTileIds);
		const mapForFirst = this._connectionsByTileId.get(_sortedTileIds.first);
		if (!mapForFirst) {
			return;
		}
		const sides = mapForFirst.get(_sortedTileIds.second);
		if (!sides) {
			return;
		}
		sides.forEach((side1s, side0) => {
			side1s.forEach((side1) => {
				callback(_sortedTileIds.first, _sortedTileIds.second, side0, side1);
			});
		});
	}
	traverseUnconnectedSides(id: string, callback: TraverseUnconnectedSidesCallback): void {
		const mapForFirst = this._connectionsByTileId.get(id);
		if (!mapForFirst) {
			callback(ALL_SIDES);
			return;
		}
		const unconnectedSides = [...ALL_SIDES];
		mapForFirst.forEach((sides, id1) => {
			sides.forEach((side1s, side0) => {
				const index = unconnectedSides.indexOf(side0);
				if (index > -1) {
					unconnectedSides.splice(index, 1);
				}
			});
		});
		callback(unconnectedSides);
	}
	allowedTileConfig(id0: string, side0: WFCTileSide, id1: string, side1: WFCTileSide): boolean {
		sortTileIds(id0, id1, _sortedTileIds);
		const mapForFirst = this._connectionsByTileId.get(_sortedTileIds.first);
		if (!mapForFirst) {
			return false;
		}
		const sides = mapForFirst.get(_sortedTileIds.second);
		if (!sides) {
			return false;
		}
		let inverted = id0 != _sortedTileIds.first;
		const key = inverted ? side1 : side0;
		const value = inverted ? side0 : side1;
		const side1s = sides.get(key);
		if (!side1s) {
			return false;
		}

		return side1s.has(value);
	}
}
