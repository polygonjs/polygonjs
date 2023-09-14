import {WFCTilesCollection} from './WFCTilesCollection';
import {TileCorners, TileConfig, EMPTY_TILE_ID, configTilesStats, TileConfigStats, solidTilesStats} from './WFCCommon';
import {CoreWFCTileAttribute, WFCQuadTileAttribute} from './WFCAttributes';
import {tileCubeLatticeDeform} from './WFCTileDeform';
import {Object3D, Vector3, Vector4, Mesh} from 'three';
import {QuadGraph, NeighbourData} from '../graph/quad/QuadGraph';
import {QuadNode} from '../graph/quad/QuadNode';
import {Attribute} from '../geometry/Attribute';
import {pushOnArrayAtEntry, popFromArrayAtEntry} from '../MapUtils';
import {Number4} from '../../types/GlobalTypes';
import {sample, spliceSample} from '../ArrayUtils';
import {setToArray} from '../SetUtils';
import {NeighbourIndex, CCW_HALF_EDGE_SIDES} from '../graph/quad/QuadGraphCommon';
import {mod} from '../math/_Module';
import {ThreejsObject} from '../geometry/modules/three/ThreejsObject';
import {QuadObject} from '../geometry/modules/quad/QuadObject';
import {QuadPrimitive} from '../geometry/modules/quad/QuadPrimitive';

const tileCorners: TileCorners = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
	height: 1,
};
const _neighbourData: NeighbourData = {
	quadNode: null,
	neighbourIndex: null,
};
const _configStats: TileConfigStats = {
	solid: 0,
	empty: 0,
};

const _v4 = new Vector4();
export class WFCSolver {
	private _stepsCount: number = 0;
	private _objects: Object3D[] = [];
	private _tilesCollection: WFCTilesCollection;
	private _quadPositionArray: number[];
	private _quadGraph: QuadGraph = new QuadGraph();
	private _lowestEntropy: number = Number.POSITIVE_INFINITY;
	private _quadNodeByEntropy: Map<number, QuadNode[]> = new Map();
	private _allowedTileConfigsByQuadId: Map<number, TileConfig[]> = new Map();
	//
	constructor(
		tileAndConnectionObjects: Object3D[],
		public readonly quadObject: QuadObject,
		public readonly height: number
	) {
		this._tilesCollection = new WFCTilesCollection(tileAndConnectionObjects);
		const tiles = this._tilesCollection.tiles();
		const allTileConfigs: TileConfig[] = [];
		for (const tile of tiles) {
			const tileId = CoreWFCTileAttribute.getTileId(tile);
			if (tileId == EMPTY_TILE_ID) {
				allTileConfigs.push({tileId, rotation: 0});
			} else {
				allTileConfigs.push({tileId, rotation: 0});
				allTileConfigs.push({tileId, rotation: 1});
				allTileConfigs.push({tileId, rotation: 2});
				allTileConfigs.push({tileId, rotation: 3});
			}
		}

		this._quadPositionArray = this.quadObject.geometry.attributes[Attribute.POSITION].array as number[];
		const quadsCount = this.quadObject.geometry.quadsCount();
		const quadPrimitive = new QuadPrimitive(this.quadObject, 0);
		for (let i = 0; i < quadsCount; i++) {
			this._setupQuadNode(quadPrimitive, i, allTileConfigs);
		}
	}
	objects(): Object3D[] {
		return this._objects;
	}
	private _setupQuadNode(quadPrimitive: QuadPrimitive, i: number, allTileConfigs: TileConfig[]) {
		quadPrimitive.setIndex(i, this.quadObject);
		const tileId: string = (quadPrimitive.attribValue(WFCQuadTileAttribute.TILE_ID) as string | undefined) || '';
		const tileIds = tileId.trim().length > 0 ? tileId.split(' ') : [];
		const tileIdsSet = new Set<string>(tileIds);
		const index = this.quadObject.geometry.index;
		_v4.fromArray(index, i * 4);
		const quadNode = this._quadGraph.addQuad(i, _v4.toArray() as Number4);
		const quadTileConfigs =
			tileIds.length > 0 ? allTileConfigs.filter((c) => tileIdsSet.has(c.tileId)) : [...allTileConfigs];
		const entropy = quadTileConfigs.length;
		this._allowedTileConfigsByQuadId.set(i, quadTileConfigs);
		pushOnArrayAtEntry(this._quadNodeByEntropy, entropy, quadNode);
		if (entropy < this._lowestEntropy) {
			this._lowestEntropy = entropy;
		}
	}

	step(quadSeed: number, configSeed: number) {
		this._stepsCount++;
		const quadNode = this._quadNodeWithLowestEntropy(quadSeed + this._stepsCount);
		if (!quadNode) {
			// console.warn('no quad left');
			return;
		}
		const allowedConfigs = this._allowedTileConfigsByQuadId.get(quadNode.id);
		if (!(allowedConfigs && allowedConfigs.length > 0)) {
			console.warn('no allowed config for quad', quadNode.id);
			return;
		}
		configTilesStats(allowedConfigs, _configStats);

		const config =
			_configStats.solid == 0
				? allowedConfigs[0]
				: sample(solidTilesStats(allowedConfigs), configSeed + this._stepsCount)!;
		this._allowedTileConfigsByQuadId.set(quadNode.id, [config]);
		this._approveConfigForQuad(config, quadNode);
		this._updateNeighboursEntropy(quadNode);
	}
	addUnresolvedTileObjects() {
		const unresolvedTile = this._tilesCollection.unresolvedTile();
		if (!unresolvedTile) {
			return;
		}

		this._quadNodeByEntropy.forEach((quadNodes, entropy) => {
			for (const quadNode of quadNodes) {
				const clonedObject = this._placeObjectOnQuad(unresolvedTile, quadNode, 0);
				CoreWFCTileAttribute.setEntropy(clonedObject, entropy);
			}
		});
	}
	private _approveConfigForQuad(config: TileConfig, quadNode: QuadNode) {
		const tileId = config.tileId;

		const templateTileObject = this._tilesCollection.tile(tileId);
		if (!templateTileObject) {
			console.error('no tiles found with id', tileId);
			return;
		}

		this._placeObjectOnQuad(templateTileObject, quadNode, config.rotation);
	}
	private _placeObjectOnQuad(object: Object3D, quadNode: QuadNode, rotation: NeighbourIndex) {
		const tileObject = ThreejsObject.clone(object);
		this._quadNodeCorners(quadNode, tileCorners);
		tileCorners.height = this.height;
		tileObject.traverse((child) => {
			const geometry = (child as Mesh).geometry;
			if (!geometry) {
				return;
			}
			tileCubeLatticeDeform(child, tileCorners, rotation);
		});
		this._objects.push(tileObject);
		return tileObject;
	}

	private _updateNeighboursEntropy(quadNode: QuadNode) {
		const stack: QuadNode[] = [quadNode];
		while (stack.length > 0) {
			const currentQuad = stack.pop()!;
			for (let i: NeighbourIndex = 0; i < 4; i++) {
				this._quadGraph.neighbourData(currentQuad.id, i as NeighbourIndex, _neighbourData);
				if (
					_neighbourData.quadNode &&
					this._allowedTileConfigsByQuadId.get(_neighbourData.quadNode.id)!.length > 1
				) {
					this._updateQuadEntropy(_neighbourData.quadNode, stack);
				}
			}
		}
	}
	private _updateQuadEntropy(quadNode: QuadNode, stack: QuadNode[]) {
		const allowedTileConfigs = this._allowedTileConfigsByQuadId.get(quadNode.id)!;

		const previousEntropy = allowedTileConfigs.length;
		this._reduceEntropy(quadNode, allowedTileConfigs);
		const updatedEntropy = allowedTileConfigs.length;

		if (updatedEntropy == previousEntropy) {
			return;
		}

		stack.push(quadNode);
		popFromArrayAtEntry(this._quadNodeByEntropy, previousEntropy, quadNode);

		switch (updatedEntropy) {
			case 0: {
				const errorTile = this._tilesCollection.errorTile();
				if (errorTile) {
					this._placeObjectOnQuad(errorTile, quadNode, 0 /* we can use any rotation in this case */);
				}
				return;
			}
			case 1: {
				const config = allowedTileConfigs[0];
				this._approveConfigForQuad(config, quadNode);
				return;
			}
			default: {
				pushOnArrayAtEntry(this._quadNodeByEntropy, updatedEntropy, quadNode);
				if (updatedEntropy <= this._lowestEntropy && updatedEntropy > 1) {
					this._lowestEntropy = updatedEntropy;
				}
			}
		}
	}

	private _reduceEntropy(quadNode: QuadNode, allowedTileConfigs: TileConfig[]) {
		let i = 0;
		while (i < allowedTileConfigs.length) {
			const allowed = this._checkConfigAgainstNeighbours(quadNode.id, allowedTileConfigs[i]);
			if (allowed) {
				i++;
			} else {
				allowedTileConfigs.splice(i, 1);
			}
		}

		// if the allowedTileConfigs contain a single solid tile and empty tiles, remove the empty tiles
		if (allowedTileConfigs.length > 1) {
			configTilesStats(allowedTileConfigs, _configStats);
			switch (_configStats.solid) {
				case 0: {
					// if none is solid, we keep the first empty
					allowedTileConfigs.splice(1, allowedTileConfigs.length - 1);
					return;
				}
				case 1: {
					// if one is solid, we keep this one
					const _getIndex = () => {
						let index = 0;
						for (const tileConfig of allowedTileConfigs) {
							if (tileConfig.tileId != EMPTY_TILE_ID) {
								return index;
							}
							index++;
						}
						return index;
					};
					const index = _getIndex();
					allowedTileConfigs.splice(index + 1, allowedTileConfigs.length).splice(index - 1, index);
				}
			}
		}
	}
	private _checkConfigAgainstNeighbours(quadNodeId: number, tileConfig: TileConfig): boolean {
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 0)) {
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 1)) {
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 2)) {
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 3)) {
			return false;
		}

		return true;
	}
	private _isConfigAllowedWithNeighbour(
		quadNodeId: number,
		tileConfig: TileConfig,
		neighbourIndex: NeighbourIndex
	): boolean {
		this._quadGraph.neighbourData(quadNodeId, neighbourIndex, _neighbourData);
		if (!_neighbourData.quadNode || _neighbourData.neighbourIndex == null) {
			return true;
		}
		const presentedSide0 = CCW_HALF_EDGE_SIDES[mod(neighbourIndex - tileConfig.rotation, 4)];
		const neighbourConfigs = this._allowedTileConfigsByQuadId.get(_neighbourData.quadNode.id)!;
		if (neighbourConfigs.length == 0) {
			// if neighbour has no config, it is empty, so the config is allowed
			return true;
		}
		for (const neighbourConfig of neighbourConfigs) {
			const presentedSide1 =
				CCW_HALF_EDGE_SIDES[mod(_neighbourData.neighbourIndex - neighbourConfig.rotation, 4)];
			const isAllowed = this._tilesCollection.allowedTileConfig(
				tileConfig.tileId,
				presentedSide0,
				neighbourConfig.tileId,
				presentedSide1
			);
			if (isAllowed) {
				return true;
			}
		}
		return false;
	}

	private _quadNodeWithLowestEntropy(seed: number) {
		let quadNodes = this._quadNodeByEntropy.get(this._lowestEntropy);

		// update lowest entropy if needed
		while (quadNodes && quadNodes.length == 0) {
			this._quadNodeByEntropy.delete(this._lowestEntropy);
			const entropiesSet: Set<number> = new Set();
			this._quadNodeByEntropy.forEach((quadNodes, entropy) => {
				entropiesSet.add(entropy);
			});
			const sortedEntropies = setToArray(entropiesSet).sort((a, b) => a - b);
			if (sortedEntropies.length == 0) {
				return;
			}
			this._lowestEntropy = sortedEntropies[0];

			quadNodes = this._quadNodeByEntropy.get(this._lowestEntropy);
		}
		if (!quadNodes) {
			return;
		}

		const quadNode = spliceSample(quadNodes, seed);
		if (!quadNode) {
			return;
		}

		return quadNode;
	}
	private _quadNodeCorners(quadNode: QuadNode, target: TileCorners) {
		target.p0.fromArray(this._quadPositionArray, quadNode.indices[0] * 3);
		target.p1.fromArray(this._quadPositionArray, quadNode.indices[3] * 3);
		target.p2.fromArray(this._quadPositionArray, quadNode.indices[2] * 3);
		target.p3.fromArray(this._quadPositionArray, quadNode.indices[1] * 3);
	}
}
