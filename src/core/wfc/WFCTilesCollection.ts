import {QuadHalfEdgeCardinality} from '../graph/quad/QuadGraphCommon';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {WFCAvailableTileNeighbours, createEmptyAvailableTileNeighbours, WFCTileSide} from './WFCCommon';
import {WFCConnection} from './WFCConnection';
import {filterTileObjects, filterConnectionObjects} from './WFCUtils';
import {Object3D} from 'three';
export class WFCTilesCollection {
	private _tiles: Object3D[];
	private _tilesById: Map<string, Object3D>;
	private _availableNeighboursByTileId: Map<string, WFCAvailableTileNeighbours>;
	// private _connections: WFCConnection[];
	constructor(objects: Object3D[]) {
		this._tiles = filterTileObjects(objects);
		this._tilesById = new Map();
		for (let tile of this._tiles) {
			this._tilesById.set(CoreWFCTileAttribute.getTileId(tile), tile);
		}

		const connectionObjects = filterConnectionObjects(objects);
		const connections = connectionObjects
			.filter((o) => WFCConnection.validConnectionObject(o))
			.map((o) => new WFCConnection(o));

		const connectionsById0 = new Map<string, WFCConnection[]>();
		this._availableNeighboursByTileId = new Map();
		let i = 0;
		for (const connection of connections) {
			const connections = connectionsById0.get(connection.id0) || [];
			connections.push(connection);
			connectionsById0.set(connection.id0, connections);
			console.log(i++, connection.id0, connection.side0, connection.id1, connection.side1);
		}
		connectionsById0.forEach((connections, tileId) => {
			const availableNeighbours: WFCAvailableTileNeighbours = createEmptyAvailableTileNeighbours();
			this._availableNeighboursByTileId.set(tileId, availableNeighbours);
			for (const connection of connections) {
				const neighbourId = connection.id1;
				const currentTileSide = connection.side0;
				const neighbourSide = connection.side1;
				// availableNeighbours[currentTileSide] = availableNeighbours[neighbourSide] || [];
				availableNeighbours[currentTileSide].push({id: neighbourId, side: neighbourSide});
			}
		});
	}
	tiles() {
		return this._tiles;
	}
	tile(tileId: string) {
		return this._tilesById.get(tileId);
	}
	// availableNeighbours(tileId: string, side: WFCTileSide): PotentialNeighbour[] {
	// 	const availableTiles = this._availableNeighboursByTileId.get(tileId);
	// 	if (!availableTiles) {
	// 		return [];
	// 	}
	// 	return availableTiles[side];
	// }
	allowedTileConfig(
		id0: string,
		side0: WFCTileSide,
		id1: string,
		side1: WFCTileSide,
		id1Cardinality?: QuadHalfEdgeCardinality
	): boolean {
		console.log({id0, side0, id1, side1, id1Cardinality});
		const fromId0 = this._availableNeighboursByTileId.get(id0);
		if (!fromId0) {
			// console.log('NO allowedTileConfig - no fromId0', id0);
			return false;
		}
		const fromId0Side0 = fromId0[side0];
		if (!fromId0Side0) {
			// console.log('NO allowedTileConfig - no fromId0Side0', id0, side0);
			return false;
		}
		if (fromId0Side0.length == 0) {
			// console.log('NO allowedTileConfig - fromId0Side0 empty', id0, side0, this._availableNeighboursByTileId);
			return false;
		}
		// if (id1Cardinality) {
		// console.log('allowedTileConfig', fromId0Side0, id1Cardinality, id0, side0, id1, side1);
		// }
		if (id1Cardinality) {
			console.log('same as cardinality?', {side1, id1Cardinality}, side1 == id1Cardinality);
			return side1 == id1Cardinality;
			// for (const potentialNeighbour of fromId0Side0) {
			// 	if (potentialNeighbour.id == id1 && potentialNeighbour.side == side1) {
			// 		return true;
			// 	}
			// }
		} else {
			console.log('fromId0Side0', fromId0Side0);
			for (const potentialNeighbour of fromId0Side0) {
				if (potentialNeighbour.id == id1 /*&& potentialNeighbour.side == side1*/) {
					return true;
				}
			}
		}
		return false;
	}
}
