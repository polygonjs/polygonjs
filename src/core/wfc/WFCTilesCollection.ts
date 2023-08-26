// import {pushOnArrayAtEntry} from '../MapUtils';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {WFCTileSide, EMPTY_TILE_ID, sortTileIds, SortedTileIds, ALL_HORIZONTAL_SIDES} from './WFCCommon';
import {validConnectionObject, wfcConnectionFromObject} from './WFCConnection';
import {filterTileObjects, filterConnectionObjects} from './WFCUtils';
import {Object3D} from 'three';
import {createEmptyTileObject} from './WFCDebugTileObjects';

const _sortedTileIds: SortedTileIds = {
	first: '',
	second: '',
};

// function validSide0(connection: WFCConnection, side: WFCTileSide): boolean {
// 	return connection.side0 == side || side.includes(connection.side0) || connection.side0.includes(side);
// }
// function validSide1(connection: WFCConnection, side: WFCTileSide): boolean {
// 	return connection.side1 == side || side.includes(connection.side1) || connection.side1.includes(side);
// }
export class WFCTilesCollection {
	private _tiles: Object3D[];
	private _tilesById: Map<string, Object3D>;
	private _connectionsByTileId: Map<string, Map<string, Map<WFCTileSide, Set<WFCTileSide>>>> = new Map();
	constructor(objects: Object3D[]) {
		this._tiles = filterTileObjects(objects);
		this._tilesById = new Map();
		for (let tile of this._tiles) {
			this._tilesById.set(CoreWFCTileAttribute.getTileId(tile), tile);
		}
		// if (0 + 0) {
		const emptyTile = createEmptyTileObject();
		this._tiles.push(emptyTile);
		this._tilesById.set(EMPTY_TILE_ID, emptyTile);
		// }

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
			// connections.push({
			// 	id0: EMPTY_TILE_ID,
			// 	side0: ALL_HORIZONTAL_SIDES,
			// 	id1: 't1',
			// 	side1: side0,
			// });
		}
		for (const side0 of ['w', 'e'] as WFCTileSide[]) {
			connections.push({
				id0: 't0',
				side0,
				id1: EMPTY_TILE_ID,
				side1: ALL_HORIZONTAL_SIDES,
			});
			// connections.push({
			// 	id0: EMPTY_TILE_ID,
			// 	side0: ALL_HORIZONTAL_SIDES,
			// 	id1: 't0',
			// 	side1: side0,
			// });
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
			sortTileIds(connection.id0, connection.id1, _sortedTileIds);
			let mapForId0 = this._connectionsByTileId.get(_sortedTileIds.first);
			if (!mapForId0) {
				mapForId0 = new Map();
				this._connectionsByTileId.set(_sortedTileIds.first, mapForId0);
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
						// console.log(_sortedTileIds.first, _sortedTileIds.second, side0, side1);
					}
				}
			}
			// pushOnArrayAtEntry(mapForId0, _sortedTileIds.second, connection);
		}
		console.log(this._connectionsByTileId);
	}
	tiles() {
		return this._tiles;
	}
	tile(tileId: string) {
		return this._tilesById.get(tileId);
	}

	allowedTileConfig(id0: string, side0: WFCTileSide, id1: string, side1: WFCTileSide): boolean {
		// console.log('allowedTileConfig', {id0, side0, id1, side1});
		sortTileIds(id0, id1, _sortedTileIds);
		const mapForFirst = this._connectionsByTileId.get(_sortedTileIds.first);
		if (!mapForFirst) {
			// console.log('no map for key', _sortedTileIds.first);
			return false;
		}
		const sides = mapForFirst.get(_sortedTileIds.second);
		if (!sides) {
			// console.log('no connections', mapForFirst, _sortedTileIds.second);
			return false;
		}
		let inverted = id0 != _sortedTileIds.first;
		const key = inverted ? side1 : side0;
		const value = inverted ? side0 : side1;
		const side1s = sides.get(key);
		if (!side1s) {
			// console.log('no side1s', key);
			return false;
		}
		// console.log(
		// 	'has',
		// 	this._connectionsByTileId,
		// 	{inverted},
		// 	_sortedTileIds,
		// 	key,
		// 	value,
		// 	side1s,
		// 	side1s.has(value)
		// );
		return side1s.has(value);

		// for (const connection of connections) {
		// 	const directValid = validSide0(connection, side0) && validSide1(connection, side1);
		// 	const invertedValid = validSide0(connection, side1) && validSide1(connection, side0);
		// 	const valid = inverted ? invertedValid : directValid;

		// 	if (valid) {
		// 		// console.log('true!');
		// 		return true;
		// 	}
		// }
		// // console.log('false!');
		// return false;
	}
}
