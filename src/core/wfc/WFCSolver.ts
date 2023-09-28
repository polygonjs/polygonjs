import {WFCTilesCollection} from './WFCTilesCollection';
import {TileCorners, TileConfig, EMPTY_TILE_ID, configTilesStats, TileConfigStats, solidTilesStats} from './WFCCommon';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {tileCubeLatticeDeform} from './WFCTileDeform';
import {Object3D, Vector3, Mesh} from 'three';
import {NeighbourData} from '../graph/quad/QuadGraph';
import {QuadNode} from '../graph/quad/QuadNode';
import {Attribute} from '../geometry/Attribute';
import {pushOnArrayAtEntry, popFromArrayAtEntry, addToSetAtEntry} from '../MapUtils';
import {arrayUniq, sample, spliceSample} from '../ArrayUtils';
import {setToArray} from '../SetUtils';
import {NeighbourIndex, CCW_HALF_EDGE_SIDES} from '../graph/quad/QuadGraphCommon';
import {mod} from '../math/_Module';
import {ThreejsCoreObject} from '../geometry/modules/three/ThreejsCoreObject';
import {QuadObject} from '../geometry/modules/quad/QuadObject';
import {WFCFloorGraph} from './WFCFloorGraph';
import {isQuadNodeSolveAllowed, quadPrimitiveFloorIndex} from './WFCUtils';
import {QuadPrimitive} from '../geometry/modules/quad/QuadPrimitive';
import {WFCTileConfigSampler} from './WFCTileConfigSampler';

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
const _entropiesSet: Set<number> = new Set();
const _sortedEntropies: number[] = [];

interface WFCSolverOptions {
	tileAndRuleObjects: Object3D[];
	quadObject: QuadObject;
	height: number;
}
const _tileConfigSampler = new WFCTileConfigSampler();
export class WFCSolver {
	private _height: number;
	private _stepsCount: number = 0;
	private _objects: Object3D[] = [];
	private _tilesCollection: WFCTilesCollection;
	private _quadPositionArrays: number[][] = [];
	// private _quadGraph: QuadGraph = new QuadGraph();
	private _lowestEntropy: number = Number.POSITIVE_INFINITY;
	private _quadNodeByEntropy: Map<number, QuadNode[]> = new Map();
	// private _allowedTileConfigsByQuadId: Map<number, TileConfig[]> = new Map();
	private _floorGraphs: WFCFloorGraph[] = [];
	private _quadIndicesByFloorIndex: Map<number, Set<number>> = new Map();
	private _floorGraphIndexByQuadNode: Map<QuadNode, number> = new Map();
	private _samplingWithWeightRequired: boolean = false;
	//
	constructor(options: WFCSolverOptions) {
		const {quadObject} = options;
		this._height = options.height;
		// get tile configs
		this._tilesCollection = new WFCTilesCollection(options);
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
		// check if the tiles have different weights
		const weights: number[] = [];
		arrayUniq(
			tiles.map((tile) => CoreWFCTileAttribute.getWeight(tile)),
			weights
		);
		if (weights.length > 1) {
			this._samplingWithWeightRequired = true;
		}

		// get floors count
		const primitivesCount = QuadPrimitive.primitivesCount(quadObject);
		for (let i = 0; i < primitivesCount; i++) {
			const floorIndex = quadPrimitiveFloorIndex(quadObject, i);
			addToSetAtEntry(this._quadIndicesByFloorIndex, floorIndex, i);
			// console.log('floorIndex', {i, floorIndex});
		}

		// create graphs
		this._quadIndicesByFloorIndex.forEach((quadIndices, floorIndex) => {
			this._quadPositionArrays[floorIndex] = quadObject.geometry.attributes[Attribute.POSITION].array as number[];
			const floorGraph = new WFCFloorGraph(quadObject, floorIndex);
			this._floorGraphs.push(floorGraph);
			for (const quadIndex of quadIndices) {
				this._setupQuadNode(floorGraph, quadIndex, allTileConfigs);
			}
		});
	}
	objects(): Object3D[] {
		return this._objects;
	}
	private _setupQuadNode(floorGraph: WFCFloorGraph, quadIndex: number, allTileConfigs: TileConfig[]) {
		if (!isQuadNodeSolveAllowed(floorGraph.quadObject, quadIndex)) {
			return;
		}

		const {quadNode, quadTileConfigs} = floorGraph.setupQuadNode(quadIndex, allTileConfigs);
		this._floorGraphIndexByQuadNode.set(quadNode, floorGraph.floorIndex);
		const entropy = quadTileConfigs.length;
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
		const floorGraph = this._floorGraph(quadNode);
		const allowedConfigs = floorGraph.allowedTileConfigsForQuadNode(quadNode); //this._allowedTileConfigsByQuadId.get(quadNode.id);
		if (!(allowedConfigs && allowedConfigs.length > 0)) {
			console.warn('no allowed config for quad', quadNode.id);
			return;
		}
		configTilesStats(allowedConfigs, _configStats);

		const config =
			_configStats.solid == 0
				? allowedConfigs[0]
				: this._selectConfig(allowedConfigs, configSeed + this._stepsCount);
		floorGraph.setAllowedTileConfigsForQuadNode(quadNode, [config]); //this._allowedTileConfigsByQuadId.set(quadNode.id, [config]);
		this._approveConfigForQuad(config, quadNode);
		this._updateNeighboursEntropy(quadNode);
	}
	private _selectConfig(allowedConfigs: TileConfig[], seed: number): TileConfig {
		if (this._samplingWithWeightRequired) {
			_tileConfigSampler.setItemsAndWeights(
				allowedConfigs,
				allowedConfigs.map((config) =>
					CoreWFCTileAttribute.getWeight(this._tilesCollection.tile(config.tileId)!)
				)
			);
			return _tileConfigSampler.sample(seed);
		} else {
			return sample(solidTilesStats(allowedConfigs), seed)!;
		}
	}
	// addUnresolvedTileObjects() {
	// 	const unresolvedTile = this._tilesCollection.unresolvedTile();
	// 	if (!unresolvedTile) {
	// 		return;
	// 	}

	// 	this._quadNodeByEntropy.forEach((quadNodes, entropy) => {
	// 		for (const quadNode of quadNodes) {
	// 			const clonedObject = this._placeObjectOnQuad(unresolvedTile, quadNode, 0);
	// 			CoreWFCTileAttribute.setEntropy(clonedObject, entropy);
	// 		}
	// 	});
	// }
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
		const tileObject = ThreejsCoreObject.clone(object);
		this._quadNodeCorners(quadNode, tileCorners);
		tileCorners.height = this._height;
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

	private _updateNeighboursEntropy(startQuadNode: QuadNode) {
		const stack: QuadNode[] = [startQuadNode];

		while (stack.length > 0) {
			const currentQuad = stack.pop()!;
			const floorIndex = this._floorGraphIndexByQuadNode.get(currentQuad)!;
			const floorGraph = this._floorGraphs[floorIndex];

			// update horizontal neighbours
			for (let i: NeighbourIndex = 0; i < 4; i++) {
				floorGraph.neighbourData(currentQuad.id, i as NeighbourIndex, _neighbourData);
				if (
					_neighbourData.quadNode &&
					floorGraph.allowedTileConfigsForQuadNode(_neighbourData.quadNode)!.length > 1
				) {
					this._updateQuadEntropy(_neighbourData.quadNode, stack);
				}
			}
			// update above
			const floorGraphAbove = this._floorGraphs[floorIndex + 1];
			if (floorGraphAbove) {
				const aboveQuad = floorGraphAbove.quadNode(currentQuad);
				if (aboveQuad) {
					if (floorGraphAbove.allowedTileConfigsForQuadNode(aboveQuad)!.length > 1) {
						this._updateQuadEntropy(aboveQuad, stack);
					}
				}
			}
			// update below
			const floorGraphBelow = this._floorGraphs[floorIndex - 1];
			if (floorGraphBelow) {
				const belowQuad = floorGraphBelow.quadNode(currentQuad);
				if (belowQuad) {
					if (floorGraphBelow.allowedTileConfigsForQuadNode(belowQuad)!.length > 1) {
						this._updateQuadEntropy(belowQuad, stack);
					}
				}
			}
		}
	}
	private _updateQuadEntropy(quadNode: QuadNode, stack: QuadNode[]) {
		const floorGraph = this._floorGraph(quadNode);
		const allowedTileConfigs = floorGraph.allowedTileConfigsForQuadNode(quadNode)!;
		// console.log('_updateQuadEntropy START', `${this._floorGraphIndexByQuadNode.get(quadNode)}:${quadNode.id}`, [
		// 	...allowedTileConfigs,
		// ]);
		const previousEntropy: number = allowedTileConfigs.length;
		this._reduceEntropy(quadNode, allowedTileConfigs);
		const updatedEntropy: number = allowedTileConfigs.length;

		// console.log(
		// 	'_updateQuadEntropy DONE',
		// 	`${this._floorGraphIndexByQuadNode.get(quadNode)}:${quadNode.id}`,
		// 	`${previousEntropy} -> ${updatedEntropy}`
		// );
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
			const allowed = this._checkConfigAgainstNeighbours(quadNode, allowedTileConfigs[i]);
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
	private _checkConfigAgainstNeighbours(quadNode: QuadNode, tileConfig: TileConfig): boolean {
		// const id = `${this._floorGraphIndexByQuadNode.get(quadNode)}:${quadNode.id}`;
		if (!this._isConfigAllowedWithNeighbour(quadNode, tileConfig, 0)) {
			// console.log('_checkConfigAgainstNeighbours 0', id, false);
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNode, tileConfig, 1)) {
			// console.log('_checkConfigAgainstNeighbours 1', id, false);
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNode, tileConfig, 2)) {
			// console.log('_checkConfigAgainstNeighbours 2', id, false);
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNode, tileConfig, 3)) {
			// console.log('_checkConfigAgainstNeighbours 3', id, false);
			return false;
		}
		if (!this._isConfigAllowedWithVerticalNeighbour(quadNode, tileConfig, -1)) {
			// console.log('_checkConfigAgainstNeighbours BELOW', id, false);
			return false;
		}
		if (!this._isConfigAllowedWithVerticalNeighbour(quadNode, tileConfig, +1)) {
			// console.log('_checkConfigAgainstNeighbours ABOVE', id, false);
			return false;
		}
		// console.log('_checkConfigAgainstNeighbours C', id, true);
		return true;
	}
	protected _isConfigAllowedWithNeighbour(
		quadNode: QuadNode,
		tileConfig: TileConfig,
		neighbourIndex: NeighbourIndex
	): boolean {
		const floorGraph = this._floorGraph(quadNode);
		floorGraph.neighbourData(quadNode.id, neighbourIndex, _neighbourData);
		if (!_neighbourData.quadNode || _neighbourData.neighbourIndex == null) {
			return true;
		}
		const presentedSide0 = CCW_HALF_EDGE_SIDES[mod(neighbourIndex - tileConfig.rotation, 4)];
		const neighbourConfigs = floorGraph.allowedTileConfigsForQuadNode(_neighbourData.quadNode)!;
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
	private _isConfigAllowedWithVerticalNeighbour(
		quadNode: QuadNode,
		tileConfig: TileConfig,
		floorOffset: 1 | -1
	): boolean {
		const floorIndex = this._floorGraphIndexByQuadNode.get(quadNode)!;
		const neighbourFloorIndex = floorIndex + floorOffset;
		const neighbourFloorGraph = this._floorGraphs[neighbourFloorIndex];
		if (!neighbourFloorGraph) {
			return true;
		}
		const neighbourQuadNode = neighbourFloorGraph.quadNode(quadNode);
		if (!neighbourQuadNode) {
			return true;
		}

		const neighbourConfigs = neighbourFloorGraph.allowedTileConfigsForQuadNode(neighbourQuadNode)!;
		if (neighbourConfigs.length == 0) {
			// if neighbour has no config, it is empty, so the config is allowed
			return true;
		}
		// console.log('neighbourConfigs', neighbourConfigs, tileConfig);
		for (const neighbourConfig of neighbourConfigs) {
			const presentedSide0 = floorOffset > 0 ? 't' : 'b';
			const presentedSide1 = floorOffset > 0 ? 'b' : 't';
			const isAllowed = this._tilesCollection.allowedTileConfig(
				tileConfig.tileId,
				presentedSide0,
				neighbourConfig.tileId,
				presentedSide1
			);
			// console.log(isAllowed, {
			// 	tileId0: tileConfig.tileId,
			// 	presentedSide0,
			// 	tileId1: neighbourConfig.tileId,
			// 	presentedSide1,
			// });
			if (isAllowed) {
				// if the connection is allowed, and since we are only testing vertical connection,
				// we only take a config if it has the same rotation,
				// OR if one of the tiles is the empty tile
				return (
					neighbourConfig.tileId == EMPTY_TILE_ID ||
					tileConfig.tileId == EMPTY_TILE_ID ||
					neighbourConfig.rotation == tileConfig.rotation
				);
			}
		}
		return false;
	}

	private _quadNodeWithLowestEntropy(seed: number) {
		let quadNodes = this._quadNodeByEntropy.get(this._lowestEntropy);

		// update lowest entropy if needed
		while (quadNodes && quadNodes.length == 0) {
			this._quadNodeByEntropy.delete(this._lowestEntropy);
			_entropiesSet.clear();
			this._quadNodeByEntropy.forEach((quadNodes, entropy) => {
				_entropiesSet.add(entropy);
			});
			setToArray(_entropiesSet, _sortedEntropies);
			const sortedEntropies = _sortedEntropies.sort((a, b) => a - b);
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
		const floorIndex = this._floorGraphIndexByQuadNode.get(quadNode)!;
		const array = this._quadPositionArrays[floorIndex];
		target.p0.fromArray(array, quadNode.indices[0] * 3);
		target.p1.fromArray(array, quadNode.indices[3] * 3);
		target.p2.fromArray(array, quadNode.indices[2] * 3);
		target.p3.fromArray(array, quadNode.indices[1] * 3);
	}
	private _floorGraph(quadNode: QuadNode): WFCFloorGraph {
		const floorIndex = this._floorGraphIndexByQuadNode.get(quadNode)!;
		// if(floorIndex==null){
		// 	return
		// }
		return this._floorGraphs[floorIndex];
	}
}
