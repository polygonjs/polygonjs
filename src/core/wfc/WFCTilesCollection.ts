import {pushOnArrayAtEntry} from '../MapUtils';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {WFCTileSide, EMPTY_TILE_ID, WFCConnection, ALL_HORIZONTAL_SIDES} from './WFCCommon';
import {validConnectionObject, wfcConnectionFromObject} from './WFCConnection';
import {filterTileObjects, filterConnectionObjects} from './WFCUtils';
import {Object3D} from 'three';
import {createEmptyTileObject} from './WFCDebugTileObjects';
export class WFCTilesCollection {
	private _tiles: Object3D[];
	private _tilesById: Map<string, Object3D>;
	private _connectionsByTileId: Map<string, Map<string, WFCConnection[]>> = new Map();
	constructor(objects: Object3D[]) {
		this._tiles = filterTileObjects(objects);
		this._tilesById = new Map();
		for (let tile of this._tiles) {
			this._tilesById.set(CoreWFCTileAttribute.getTileId(tile), tile);
		}
		const emptyTile = createEmptyTileObject();
		this._tiles.push(emptyTile);
		this._tilesById.set(EMPTY_TILE_ID, emptyTile);

		const connectionObjects = filterConnectionObjects(objects);
		const connections = connectionObjects.filter(validConnectionObject).map(wfcConnectionFromObject);
		// TODO: add empty to all unconnected sides
		for (const side0 of ['s', 'e', 'n'] as WFCTileSide[]) {
			connections.push({
				id0: 't1',
				side0,
				id1: EMPTY_TILE_ID,
				side1: ALL_HORIZONTAL_SIDES,
			});
			connections.push({
				id0: EMPTY_TILE_ID,
				side0: ALL_HORIZONTAL_SIDES,
				id1: 't1',
				side1: side0,
			});
		}
		for (const side0 of ['e'] as WFCTileSide[]) {
			connections.push({
				id0: 't0',
				side0,
				id1: EMPTY_TILE_ID,
				side1: ALL_HORIZONTAL_SIDES,
			});
			connections.push({
				id0: EMPTY_TILE_ID,
				side0: ALL_HORIZONTAL_SIDES,
				id1: 't0',
				side1: side0,
			});
		}
		connections.push({
			id0: EMPTY_TILE_ID,
			side0: ALL_HORIZONTAL_SIDES,
			id1: EMPTY_TILE_ID,
			side1: ALL_HORIZONTAL_SIDES,
		});

		// const connectionsById0 = new Map<string, WFCConnection[]>();
		// this._availableNeighboursByTileId = new Map();
		// let i = 0;
		for (const connection of connections) {
			let mapForId0 = this._connectionsByTileId.get(connection.id0);
			if (!mapForId0) {
				mapForId0 = new Map();
				this._connectionsByTileId.set(connection.id0, mapForId0);
			}
			pushOnArrayAtEntry(mapForId0, connection.id1, connection);
			console.log(connection.id0, connection.side0, connection.id1, connection.side1);
		}
	}
	tiles() {
		return this._tiles;
	}
	tile(tileId: string) {
		return this._tilesById.get(tileId);
	}

	allowedTileConfig(id0: string, side0: WFCTileSide, id1: string, side1: WFCTileSide): boolean {
		const mapForId0 = this._connectionsByTileId.get(id0);
		if (!mapForId0) {
			// console.log('no map');
			return false;
		}
		const connections = mapForId0.get(id1);
		if (!connections) {
			// console.log('no connections', mapForId0, id1);
			return false;
		}
		// const debug = true; // && id0 == 't1';
		// if (debug)
		// console.log('connections', {side0, side1}, connections.map((c) => [c.side0, c.side1].join('-')).join(', '));
		for (const connection of connections) {
			if (
				(connection.side0 == side0 || side0.includes(connection.side0) || connection.side0.includes(side0)) &&
				(connection.side1 == side1 || side1.includes(connection.side1) || connection.side1.includes(side1))
			) {
				// console.log('true!');
				return true;
			}
		}
		// console.log('false!');
		return false;
	}
}
