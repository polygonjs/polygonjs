import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {CoreWFCConnectionAttribute} from './WFCAttributes';
import {
	WFCTileSide,
	WFCAvailableTileNeighbours,
	createEmptyAvailableTileNeighbours,
	PotentialNeighbour,
} from './WFCCommon';
import {WFCConnection} from './WFCConnection';
import {filterTileObjects, filterConnectionObjects} from './WFCUtils';
import {Object3D} from 'three';
export class WFCTilesCollection {
	private _tiles: Object3D[];
	private _tilesById: Map<string, ObjectContent<CoreObjectType>>;
	private _availableNeighboursByTileId: Map<string, WFCAvailableTileNeighbours>;
	// private _connections: WFCConnection[];
	constructor(objects: ObjectContent<CoreObjectType>[]) {
		this._tiles = filterTileObjects(objects);
		this._tilesById = new Map();
		for (let tile of this._tiles) {
			this._tilesById.set(CoreWFCConnectionAttribute.getId0(tile), tile);
		}

		const connectionObjects = filterConnectionObjects(objects);
		const connections = connectionObjects
			.filter((o) => WFCConnection.validConnectionObject(o))
			.map((o) => new WFCConnection(o));

		const connectionsById0 = new Map<string, WFCConnection[]>();
		this._availableNeighboursByTileId = new Map();
		for (const connection of connections) {
			const connections = connectionsById0.get(connection.id0) || [];
			connections.push(connection);
			connectionsById0.set(connection.id0, connections);
		}
		connectionsById0.forEach((connections, tileId) => {
			const availableNeighbours: WFCAvailableTileNeighbours = createEmptyAvailableTileNeighbours();
			this._availableNeighboursByTileId.set(tileId, availableNeighbours);
			for (const connection of connections) {
				const neighbourId = connection.id1;
				const neighbourSide = connection.side1;
				availableNeighbours[neighbourSide].push({id: neighbourId, side: neighbourSide});
			}
		});
	}
	tiles() {
		return this._tiles;
	}
	tile(tileId: string) {
		return this._tilesById.get(tileId);
	}
	availableNeighbours(tileId: string, side: WFCTileSide): PotentialNeighbour[] {
		const availableTiles = this._availableNeighboursByTileId.get(tileId);
		if (!availableTiles) {
			return [];
		}
		return availableTiles[side];
	}
}
