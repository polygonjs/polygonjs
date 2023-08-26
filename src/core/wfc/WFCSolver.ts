import {WFCTilesCollection} from './WFCTilesCollection';
import {TileCorners, TileConfig, EMPTY_TILE_ID} from './WFCCommon';
import {Object3D, Vector3, Vector4, Mesh} from 'three';
import {CoreObject} from '../geometry/Object';
import {tileCubeLatticeDeform} from './WFCTileDeform';
import {QuadObject} from '../geometry/quad/QuadObject';
import {QuadGraph, NeighbourData} from '../graph/quad/QuadGraph';
import {QuadNode} from '../graph/quad/QuadNode';
import {Attribute} from '../geometry/Attribute';
import {pushOnArrayAtEntry, popFromArrayAtEntry} from '../MapUtils';
import {Number4} from '../../types/GlobalTypes';
import {sample, spliceSample} from '../ArrayUtils';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {setToArray} from '../SetUtils';
import {NeighbourIndex, CCW_HALF_EDGE_SIDES} from '../graph/quad/QuadGraphCommon';
// import {logRedBg} from '../logger/Console';
import {mod} from '../math/_Module';
import {ERROR_TILE_OBJECT} from './WFCDebugTileObjects';

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

		this._quadPositionArray = this.quadObject.geometry.attributes[Attribute.POSITION].array;
		const quadsCount = this.quadObject.geometry.quadsCount();
		const index = this.quadObject.geometry.index;
		for (let i = 0; i < quadsCount; i++) {
			_v4.fromArray(index, i * 4);
			const quadNode = this._quadGraph.addQuad(i, _v4.toArray() as Number4);
			const quadTileConfigs = [...allTileConfigs];
			const entropy = quadTileConfigs.length;
			this._allowedTileConfigsByQuadId.set(i, quadTileConfigs);
			pushOnArrayAtEntry(this._quadNodeByEntropy, entropy, quadNode);
			if (entropy < this._lowestEntropy) {
				this._lowestEntropy = entropy;
			}
		}
	}
	objects(): Object3D[] {
		return this._objects;
	}

	step(quadSeed: number, configSeed: number) {
		this._stepsCount++;
		// const previousEntropy = this._lowestEntropy;
		const quadNode = this._quadNodeWithLowestEntropy(quadSeed + this._stepsCount);
		console.log('*** step', {stepsCount: this._stepsCount, quadId: quadNode?.id, indices: quadNode?.indices});
		if (!quadNode) {
			console.warn('no quad left');
			return;
		}
		const allowedConfigs = this._allowedTileConfigsByQuadId.get(quadNode.id);
		if (!(allowedConfigs && allowedConfigs.length > 0)) {
			console.warn('no allowed config for quad', quadNode.id);
			return;
		}
		const config = sample(allowedConfigs, configSeed + this._stepsCount)!;
		this._allowedTileConfigsByQuadId.set(quadNode.id, [config]);
		console.log('step result', this._stepsCount, allowedConfigs, config);
		this._approveConfigForQuad(config, quadNode);
		//
		// popFromArrayAtEntry(this._quadNodeByEntropy, previousEntropy, quadNode);
		// this._markAsCollapsed(quadNode.id, config);

		this._updateNeighboursEntropy(quadNode);

		console.log(
			this._stepsCount,
			'lowest entropy',
			this._lowestEntropy,
			this._quadNodeByEntropy,
			this._allowedTileConfigsByQuadId
		);
	}
	private _approveConfigForQuad(config: TileConfig, quadNode: QuadNode) {
		const tileId = config.tileId;
		// console.log(this._stepsCount, config);
		const templateTileObject = this._tilesCollection.tile(tileId);
		if (!templateTileObject) {
			console.error('no tiles found with id', tileId);
			return;
		}
		// const tileObject = CoreObject.clone(templateTileObject);
		this._placeObjectOnQuad(templateTileObject, quadNode, config.rotation);
		// this._quadNodeCorners(quadNode, tileCorners);
		// tileCorners.height = this.height;
		// tileObject.traverse((child) => {
		// 	const geometry = (child as Mesh).geometry;
		// 	if (!geometry) {
		// 		return;
		// 	}
		// 	tileCubeLatticeDeform(child, tileCorners, config.rotation);
		// });
		// this._objects.push(tileObject);
	}
	private _placeObjectOnQuad(object: Object3D, quadNode: QuadNode, rotation: NeighbourIndex) {
		const tileObject = CoreObject.clone(object);
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
	}

	private _updateNeighboursEntropy(quadNode: QuadNode) {
		const stack: QuadNode[] = [quadNode];
		// const visited: Set<number> = new Set();
		// visited.add(quadNode.id);
		while (stack.length > 0) {
			const currentQuad = stack.pop()!;
			// console.log('currentQuad', currentQuad.id);
			for (let i: NeighbourIndex = 0; i < 4; i++) {
				this._quadGraph.neighbourData(currentQuad.id, i as NeighbourIndex, _neighbourData);
				// console.log('neighbour', {i, currentQuadId: currentQuad.id, neighbourId: neighbour?.id});
				if (
					_neighbourData.quadNode &&
					this._allowedTileConfigsByQuadId.get(_neighbourData.quadNode.id)!.length > 1
				) {
					this._updateQuadEntropy(_neighbourData.quadNode, stack);
					// const possibleTileConfigs = this._allowedTileConfigsByQuadId.get(neighbour.id);
					// if (possibleTileConfigs && possibleTileConfigs.length) {
					// 	const previousEntropy = possibleTileConfigs.length;
					// 	this._reduceEntropy(neighbour, possibleTileConfigs);
					// 	const updatedEntropy = possibleTileConfigs.length;
					// 	if (updatedEntropy != previousEntropy) {
					// 			stack.push(neighbour);
					// 		popFromArrayAtEntry(this._quadNodeByEntropy, previousEntropy, neighbour);
					// 		pushOnArrayAtEntry(this._quadNodeByEntropy, updatedEntropy, neighbour);
					// 		if (updatedEntropy < this._lowestEntropy) {
					// 			this._lowestEntropy = updatedEntropy;
					// 		}
					// 	}
					// }
				}
			}
		}
	}
	private _updateQuadEntropy(quadNode: QuadNode, stack: QuadNode[]) {
		// if (visited.has(quadNode.id)) {
		// 	return;
		// }

		// visited.add(quadNode.id);
		const allowedTileConfigs = this._allowedTileConfigsByQuadId.get(quadNode.id)!;
		// if (!allowedTileConfigs || allowedTileConfigs.length == 0) {
		// 	return;
		// }

		// this._quadGraph.cardinalities(quadNode.id, _neighbourCardinalities);

		const previousEntropy = allowedTileConfigs.length;
		this._reduceEntropy(quadNode, allowedTileConfigs);
		const updatedEntropy = allowedTileConfigs.length;

		if (updatedEntropy == previousEntropy) {
			// console.log('unchanged entropy for quad', quadNode.id, updatedEntropy);
			return;
		}
		// console.log('updatedEntropy', quadNode.id, previousEntropy, updatedEntropy);

		// console.log('updated entropy, id:', quadNode.id, 'prev:', previousEntropy, '->', updatedEntropy);
		stack.push(quadNode);
		popFromArrayAtEntry(this._quadNodeByEntropy, previousEntropy, quadNode);

		switch (updatedEntropy) {
			case 0: {
				// console.error('no possible tile config for quad', quadNode.id);
				this._placeObjectOnQuad(ERROR_TILE_OBJECT, quadNode, 0 /* we can use any rotation in this case */);
				return;
			}
			case 1: {
				const config = allowedTileConfigs[0];
				// console.log('isolated 1 tile config for quad', quadNode.id, config);
				this._approveConfigForQuad(config, quadNode);
				return;
			}
			default: {
				pushOnArrayAtEntry(this._quadNodeByEntropy, updatedEntropy, quadNode);
				if (updatedEntropy <= this._lowestEntropy && updatedEntropy > 1) {
					this._lowestEntropy = updatedEntropy;
					// console.log('set lowest entropy', quadNode.id, this._lowestEntropy);
				}
			}
		}
		// if (updatedEntropy == 0) {
		// 	console.log('no possible tile config for quad', quadNode.id);
		// }

		// // console.log('pop', quadNode.id, previousEntropy, updatedEntropy);
		// if (updatedEntropy <= 1) {
		// 	if (updatedEntropy == 0) {
		// 		console.log('no possible tile config for quad', quadNode.id);
		// 	} else {
		// 		const config = allowedTileConfigs[0];
		// 		console.log('isolated 1 tile config for quad', quadNode.id, config);
		// 		this._addConfigToObject(quadNode, config);
		// 	}
		// 	// mark as collapsed with an empty tile
		// 	// this._markAsCollapsed(quadNode.id, null);
		// } else {
		// 	pushOnArrayAtEntry(this._quadNodeByEntropy, updatedEntropy, quadNode);
		// 	// console.log('push', quadNode.id, updatedEntropy);
		// }

		// if (updatedEntropy <= this._lowestEntropy && updatedEntropy > 1) {
		// 	this._lowestEntropy = updatedEntropy;
		// 	// console.log('set lowest entropy', quadNode.id, this._lowestEntropy);
		// }
	}
	// private _markAsCollapsed(quadId: number, config: TileConfig | null) {
	// 	this._quadGraph.setQuadCardinality(quadId, 's');
	// 	if (config) {
	// 		this._collapsedTileConfigByQuadId.set(quadId, {tileId: config.tileId, rotation: config.rotation});
	// 	} else {
	// 		this._collapsedTileConfigByQuadId.set(quadId, null);
	// 	}
	// }

	private _reduceEntropy(
		quadNode: QuadNode,
		allowedTileConfigs: TileConfig[]
		// neighbourCardinalities: NeighbourCardinalities
	) {
		// const debug = true && quadNode.id == 1;
		// if (debug) logRedBg('reduce entropy ' + quadNode.id);
		// console.log({quadNodeId: quadNode.id, possibleTileConfigs});
		let i = 0;
		// console.log('before', possibleTileConfigs);
		while (i < allowedTileConfigs.length) {
			// if (debug) console.log('');
			// if (debug) console.log('----- > check config', allowedTileConfigs[i]);

			const allowed = this._checkConfigAgainstNeighbours(quadNode.id, allowedTileConfigs[i]);
			// if (debug) console.log(quadNode.id, allowedTileConfigs[i], allowed);
			if (allowed) {
				i++;
			} else {
				allowedTileConfigs.splice(i, 1);
			}
		}

		// if the allowedTileConfigs contain a single solid tile and empty tiles, remove the empty tiles
		if (allowedTileConfigs.length > 1) {
			let solidTilesCount = 0;
			let emptyTilesCount = 0;
			for (const config of allowedTileConfigs) {
				if (config.tileId == EMPTY_TILE_ID) {
					emptyTilesCount++;
				} else {
					solidTilesCount++;
				}
			}
			if (solidTilesCount == 1 && emptyTilesCount >= 1) {
				allowedTileConfigs = allowedTileConfigs.filter((config) => config.tileId != EMPTY_TILE_ID);
			}
		}

		// if (debug) console.log('remaining configs', quadNode.id, allowedTileConfigs);
	}
	private _checkConfigAgainstNeighbours(
		quadNodeId: number,
		tileConfig: TileConfig
		// neighbourCardinalities: NeighbourCardinalities
	): boolean {
		// const debug = true && quadNodeId == 1;
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 0)) {
			// if (debug)
			// 	console.log(
			// 		'not allowed with neighbour',
			// 		0,
			// 		{quadNodeId},
			// 		// this._quadGraph.neighbour(quadNodeId, 0)?.id,
			// 		tileConfig
			// 	);
			return false;
		}
		// if (debug)
		// 	console.log(
		// 		' allowed with neighbour',
		// 		0,
		// 		{quadNodeId},
		// 		// this._quadGraph.neighbour(quadNodeId, 0)?.id,
		// 		tileConfig
		// 	);
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 1)) {
			// if (debug)
			// 	console.log(
			// 		'not allowed with neighbour',
			// 		1,
			// 		{quadNodeId},
			// 		// this._quadGraph.neighbour(quadNodeId, 1)?.id,
			// 		tileConfig
			// 	);
			return false;
		}
		// if (debug)
		// 	console.log(
		// 		' allowed with neighbour',
		// 		1,
		// 		{quadNodeId},
		// 		// this._quadGraph.neighbour(quadNodeId, 0)?.id,
		// 		tileConfig
		// 	);
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 2)) {
			// if (debug)
			// 	console.log(
			// 		'not allowed with neighbour',
			// 		2,
			// 		{quadNodeId},
			// 		// this._quadGraph.neighbour(quadNodeId, 2)?.id,
			// 		tileConfig
			// 	);
			return false;
		}
		if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, 3)) {
			// if (debug)
			// 	console.log(
			// 		'not allowed with neighbour',
			// 		3,
			// 		{quadNodeId},
			// 		// this._quadGraph.neighbour(quadNodeId, 3)?.id,
			// 		tileConfig
			// 	);
			return false;
		}

		return true;
	}
	private _isConfigAllowedWithNeighbour(
		quadNodeId: number,
		tileConfig: TileConfig,
		// neighbourCardinalities: NeighbourCardinalities,
		neighbourIndex: NeighbourIndex
	): boolean {
		// const debug = true && quadNodeId == 1;
		this._quadGraph.neighbourData(quadNodeId, neighbourIndex, _neighbourData);
		if (!_neighbourData.quadNode || _neighbourData.neighbourIndex == null) {
			return true;
		}
		// const rotationRequired = mod(tileConfig.rotation - neighbourIndex, 4);
		const presentedSide0 = CCW_HALF_EDGE_SIDES[mod(neighbourIndex + tileConfig.rotation, 4)];
		// const side0 = CCW_HALF_EDGE_CARDINALITIES[mod(neighbourIndex + rotationRequired, 4)];
		const neighbourConfigs = this._allowedTileConfigsByQuadId.get(_neighbourData.quadNode.id)!;
		if (neighbourConfigs.length == 0) {
			// if neighbour has no config, it is empty, so the config is allowed
			return true;
		}
		// if (debug)
		// 	console.log('neighbourConfigs', neighbourIndex, {quadId: _neighbourData.quadNode.id}, neighbourConfigs);
		for (const neighbourConfig of neighbourConfigs) {
			// const side0 = rotatedSide('s', neighbourConfig.rotation);
			// const side1 = rotatedSide('n', rotationRequired);
			const presentedSide1 =
				CCW_HALF_EDGE_SIDES[mod(_neighbourData.neighbourIndex + neighbourConfig.rotation, 4)];
			// if (debug) console.log({presentedSide0, presentedSide1});
			const isAllowed = this._tilesCollection.allowedTileConfig(
				tileConfig.tileId,
				presentedSide0,
				neighbourConfig.tileId,
				presentedSide1
				// quadNodeId,
				// neighbourIndex
			);
			if (isAllowed) {
				return true;
			}
		}
		return false;
	}
	// private _isConfigAllowedWithNeighbour(
	// 	quadNodeId: number,
	// 	tileConfig: TileConfig,
	// 	neighbourCardinalities: NeighbourCardinalities,
	// 	neighbourIndex: NeighbourIndex
	// ): boolean {
	// 	const debug = quadNodeId == 3;
	// 	const neighbour = this._quadGraph.neighbour(quadNodeId, neighbourIndex);
	// 	if (!neighbour) {
	// 		return true;
	// 	}
	// 	const rotationRequired = mod(tileConfig.rotation - neighbourIndex, 4);
	// 	const side0 = CCW_HALF_EDGE_CARDINALITIES[mod(neighbourIndex + rotationRequired, 4)];
	// 	if (debug) console.log({rotation: tileConfig.rotation, neighbourIndex, rotationRequired, side0});
	// 	// for (let sideIndex = 0; sideIndex < 4; sideIndex++) {
	// 	// 	const neighbour = this._quadGraph.neighbour(quadNodeId, sideIndex);
	// 	// 	if (!neighbour) {
	// 	// 		console.log('no neighbour', quadNodeId, sideIndex);
	// 	// 		continue;
	// 	// 	}
	// 	// console.log('yes neighbour', quadNodeId, neighbour.id);
	// 	const isCollapsedTile = this._collapsedTileConfigByQuadId.has(neighbour.id);
	// 	// console.log('collapsedState', quadNodeId, neighbour.id, collapsedState);
	// 	if (isCollapsedTile) {
	// 		const collapsedTile = this._collapsedTileConfigByQuadId.get(neighbour.id);
	// 		if (collapsedTile == null) {
	// 			// config is allowed if the tile is empty
	// 			return true;
	// 		}

	// 		const isAllowed = this._tilesCollection.allowedTileConfig(
	// 			tileConfig.tileId,
	// 			side0,
	// 			collapsedTile.tileId,
	// 			side0,
	// 			neighbourCardinalities,
	// 			quadNodeId,
	// 			neighbourIndex
	// 			// this._quadGraph.cardinality(neighbour.id, quadNodeId)
	// 		);
	// 		if (isAllowed) {
	// 			return true;
	// 		}
	// 	} else {
	// 		const neighbourAllowedTileConfigs = this._allowedTileConfigsByQuadId.get(neighbour.id);
	// 		if (neighbourAllowedTileConfigs && neighbourAllowedTileConfigs.length) {
	// 			for (const neighbourTileConfig of neighbourAllowedTileConfigs) {
	// 				const isAllowed = this._tilesCollection.allowedTileConfig(
	// 					tileConfig.tileId,
	// 					side0,
	// 					neighbourTileConfig.tileId,
	// 					side0,
	// 					neighbourCardinalities,
	// 					quadNodeId,
	// 					neighbourIndex
	// 				);
	// 				if (isAllowed) {
	// 					return true;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	// }
	// 	return false;
	// }

	private _quadNodeWithLowestEntropy(seed: number) {
		let quadNodes = this._quadNodeByEntropy.get(this._lowestEntropy);
		// console.log('quadNodes', this._lowestEntropy, quadNodes?.length, this._quadNodeByEntropy);

		// update lowest entropy if needed
		while (quadNodes && quadNodes.length == 0) {
			this._quadNodeByEntropy.delete(this._lowestEntropy);
			const entropiesSet: Set<number> = new Set();
			this._quadNodeByEntropy.forEach((quadNodes, entropy) => {
				entropiesSet.add(entropy);
			});
			const sortedEntropies = setToArray(entropiesSet).sort((a, b) => a - b);
			// console.log('sortedEntropies', sortedEntropies);
			if (sortedEntropies.length == 0) {
				return;
			}
			this._lowestEntropy = sortedEntropies[0];

			quadNodes = this._quadNodeByEntropy.get(this._lowestEntropy);
			// console.log('quadNodes', this._lowestEntropy, quadNodes?.length);
		}
		if (!quadNodes) {
			// console.warn('no quad nodes with lowest entropy', this._lowestEntropy);
			return;
		}

		const quadNode = spliceSample(quadNodes, seed);
		if (!quadNode) {
			// console.warn('no quad node with lowest entropy', quadNodes);
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
