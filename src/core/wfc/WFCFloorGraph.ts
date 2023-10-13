import {TileConfig} from './WFCTileConfig';
import {WFCQuadAttribute} from './WFCAttributes';
import {Vector4} from 'three';
import {QuadGraph, NeighbourData} from '../geometry/modules/quad/graph/QuadGraph';
import {QuadNode} from '../geometry/modules/quad/graph/QuadNode';
import {Number4} from '../../types/GlobalTypes';
import {NeighbourIndex} from '../geometry/modules/quad/graph/QuadGraphCommon';
import {QuadObject} from '../geometry/modules/quad/QuadObject';
import {QuadPrimitive} from '../geometry/modules/quad/QuadPrimitive';
import {quadId} from './WFCUtils';

const _v4 = new Vector4();
const DEFAULT_TILE_ID = '';
export class WFCFloorGraph {
	private _quadGraph: QuadGraph = new QuadGraph();
	private _quadNodeByQuadId: Map<number, QuadNode> = new Map();
	private _allowedTileConfigsByQuadId: Map<number, TileConfig[]> = new Map();
	//
	constructor(public readonly quadObject: QuadObject, public readonly floorIndex: number) {}

	setupQuadNode(index: number, allTileConfigs: TileConfig[]) {
		// const _quadId = quadId(this.quadObject, index);

		// if (_quadId == null) {
		// 	throw new Error(`attribute ${WFCQuadAttribute.QUAD_ID} not found`);
		// }

		// const tileId: string = QuadPrimitive.hasAttribute(this.quadObject, WFCQuadAttribute.TILE_ID)
		// 	? (QuadPrimitive.attribValue(this.quadObject, index, WFCQuadAttribute.TILE_ID) as string | undefined) ||
		// 	  DEFAULT_TILE_ID
		// 	: DEFAULT_TILE_ID;

		// const tileIds = tileId.trim().length > 0 ? tileId.split(' ') : [];
		// const tileIdsSet = new Set<string>(tileIds);
		const indices = this.quadObject.geometry.index;
		_v4.fromArray(indices, index * 4);
		const quadNode = this._quadGraph.addQuad(index, _v4.toArray() as Number4);
		// const quadTileConfigs =
		// 	tileIds.length > 0 ? allTileConfigs.filter((c) => tileIdsSet.has(c.tileId)) : [...allTileConfigs];
		// this._allowedTileConfigsByQuadId.set(index, quadTileConfigs);
		// this._quadNodeByQuadId.set(_quadId, quadNode);
		const {quadTileConfigs} = this.resetQuadNode(quadNode, allTileConfigs);
		return {quadNode, quadTileConfigs};
	}
	resetQuadNode(quadNode: QuadNode, allTileConfigs: TileConfig[]) {
		const index = quadNode.id;
		const _quadId = quadId(this.quadObject, index);

		if (_quadId == null) {
			throw new Error(`attribute ${WFCQuadAttribute.QUAD_ID} not found`);
		}

		const tileId: string = QuadPrimitive.hasAttribute(this.quadObject, WFCQuadAttribute.TILE_ID)
			? (QuadPrimitive.attribValue(this.quadObject, index, WFCQuadAttribute.TILE_ID) as string | undefined) ||
			  DEFAULT_TILE_ID
			: DEFAULT_TILE_ID;

		const tileIds = tileId.trim().length > 0 ? tileId.split(' ') : [];
		const tileIdsSet = new Set<string>(tileIds);

		const quadTileConfigs =
			tileIds.length > 0 ? allTileConfigs.filter((c) => tileIdsSet.has(c.tileId)) : [...allTileConfigs];
		this._allowedTileConfigsByQuadId.set(index, quadTileConfigs);
		this._quadNodeByQuadId.set(_quadId, quadNode);

		return {quadTileConfigs};
	}
	quadNodeFromId(quadId: number) {
		return this._quadNodeByQuadId.get(quadId);
	}
	quadNodeFromOtherQuadNode(otherGraphQuadNode: QuadNode) {
		const _quadId = quadId(this.quadObject, otherGraphQuadNode.id);
		return this._quadNodeByQuadId.get(_quadId);
	}
	allowedTileConfigsForQuadNode(quadNode: QuadNode) {
		return this._allowedTileConfigsByQuadId.get(quadNode.id);
	}
	setAllowedTileConfigsForQuadNode(quadNode: QuadNode, tileConfigs: TileConfig[]) {
		this._allowedTileConfigsByQuadId.set(quadNode.id, tileConfigs);
	}
	neighbourData(quadId: number, sideIndex: NeighbourIndex, target: NeighbourData): void {
		this._quadGraph.neighbourData(quadId, sideIndex, target);
	}
}
