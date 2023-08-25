import {WFCTilesCollection} from './WFCTilesCollection';
import {TileCorners, TileConfig} from './WFCCommon';
import {Object3D, Vector3, Vector4, Mesh} from 'three';
import {CoreObject} from '../geometry/Object';
import {tileCubeLatticeDeform} from './WFCTileDeform';
import {QuadObject} from '../geometry/quad/QuadObject';
import {QuadGraph} from '../graph/quad/QuadGraph';
import {QuadNode} from '../graph/quad/QuadNode';
import {Attribute} from '../geometry/Attribute';
import {pushOnArrayAtEntry, popFromArrayAtEntry} from '../MapUtils';
import {Number4} from '../../types/GlobalTypes';
import {sample, spliceSample} from '../ArrayUtils';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {setToArray} from '../SetUtils';
// import {logRedBg} from '../logger/Console';

const tileCorners: TileCorners = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
	height: 1,
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
	private _collapsedTileConfigByQuadId: Map<number, TileConfig | null> = new Map();
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
			allTileConfigs.push({tileId, lookAtSide: 'n'});
			allTileConfigs.push({tileId, lookAtSide: 'e'});
			allTileConfigs.push({tileId, lookAtSide: 's'});
			allTileConfigs.push({tileId, lookAtSide: 'w'});
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
				console.log('INIT set lowest entropy', this._lowestEntropy);
			}
		}
	}
	objects(): Object3D[] {
		return this._objects;
	}

	step(seed: number) {
		this._stepsCount++;
		// const previousEntropy = this._lowestEntropy;
		const quadNode = this._quadNodeWithLowestEntropy(seed, tileCorners);
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
		const config = sample(allowedConfigs, seed)!;
		console.log(this._stepsCount, {allowedConfigs, config});

		const tileId = config.tileId;
		// console.log(this._stepsCount, config);
		const templateTileObject = this._tilesCollection.tile(tileId);
		if (!templateTileObject) {
			console.warn('no tiles found');
			return;
		}
		const tileObject = CoreObject.clone(templateTileObject);
		tileCorners.height = this.height;
		tileObject.traverse((child) => {
			const geometry = (child as Mesh).geometry;
			if (!geometry) {
				return;
			}
			tileCubeLatticeDeform(child, tileCorners);
		});
		this._objects.push(tileObject);
		//
		// popFromArrayAtEntry(this._quadNodeByEntropy, previousEntropy, quadNode);
		this._markAsCollapsed(quadNode.id, config);

		this._updateNeighboursEntropy(quadNode);

		console.log(this._stepsCount, 'lowest entropy', this._lowestEntropy, this._quadNodeByEntropy);
	}
	private _updateNeighboursEntropy(quadNode: QuadNode) {
		const stack: QuadNode[] = [quadNode];
		const visited: Set<number> = new Set();
		visited.add(quadNode.id);
		while (stack.length > 0) {
			const currentQuad = stack.pop()!;
			// console.log('currentQuad', currentQuad.id);
			for (let i = 0; i < 4; i++) {
				const neighbour = this._quadGraph.neighbour(currentQuad.id, i);
				// console.log('neighbour', {i, currentQuadId: currentQuad.id, neighbourId: neighbour?.id});
				if (neighbour && !this._collapsedTileConfigByQuadId.has(neighbour.id)) {
					this._updateQuadEntropy(neighbour, stack, visited);
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
	private _updateQuadEntropy(quadNode: QuadNode, stack: QuadNode[], visited: Set<number>) {
		// if (visited.has(quadNode.id)) {
		// 	return;
		// }
		visited.add(quadNode.id);
		const possibleTileConfigs = this._allowedTileConfigsByQuadId.get(quadNode.id);
		if (!possibleTileConfigs || possibleTileConfigs.length == 0) {
			return;
		}
		const previousEntropy = possibleTileConfigs.length;
		this._reduceEntropy(quadNode, possibleTileConfigs);
		const updatedEntropy = possibleTileConfigs.length;
		// console.log('updatedEntropy', quadNode.id, previousEntropy, updatedEntropy);
		if (updatedEntropy != previousEntropy) {
			// console.log('updated entropy, id:', quadNode.id, 'prev:', previousEntropy, '->', updatedEntropy);
			stack.push(quadNode);
			popFromArrayAtEntry(this._quadNodeByEntropy, previousEntropy, quadNode);
			// console.log('pop', quadNode.id, previousEntropy, updatedEntropy);
			if (updatedEntropy == 0) {
				// mark as collapsed with an empty tile
				this._markAsCollapsed(quadNode.id, null);
			} else {
				pushOnArrayAtEntry(this._quadNodeByEntropy, updatedEntropy, quadNode);
				// console.log('push', quadNode.id, updatedEntropy);
			}

			if (updatedEntropy <= this._lowestEntropy && updatedEntropy > 0) {
				this._lowestEntropy = updatedEntropy;
				// console.log('set lowest entropy', quadNode.id, this._lowestEntropy);
			}
		}
	}
	private _markAsCollapsed(quadId: number, config: TileConfig | null) {
		this._quadGraph.setQuadCardinality(quadId, 's');
		if (config) {
			this._collapsedTileConfigByQuadId.set(quadId, {tileId: config.tileId, lookAtSide: config.lookAtSide});
		} else {
			this._collapsedTileConfigByQuadId.set(quadId, null);
		}
	}

	private _reduceEntropy(quadNode: QuadNode, possibleTileConfigs: TileConfig[]) {
		// logRedBg('reduce entropy ' + quadNode.id);
		// console.log({quadNodeId: quadNode.id, possibleTileConfigs});
		let i = 0;
		// console.log('before', possibleTileConfigs);
		while (i < possibleTileConfigs.length) {
			console.log('----', i);
			const allowed = this._isConfigAllowed(quadNode.id, possibleTileConfigs[i]);
			console.log('isConfigAllowed', quadNode.id, possibleTileConfigs[i], allowed);
			if (allowed) {
				i++;
			} else {
				possibleTileConfigs.splice(i, 1);
			}
		}
		// console.log('after', possibleTileConfigs);
	}
	private _isConfigAllowed(quadNodeId: number, tileConfig: TileConfig): boolean {
		const neighbour0 = this._quadGraph.neighbour(quadNodeId, 0);
		if (neighbour0) {
			if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, neighbour0)) {
				// console.log('not allowed wit neighbour', 0);
				return false;
			}
		}
		const neighbour1 = this._quadGraph.neighbour(quadNodeId, 1);
		if (neighbour1) {
			if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, neighbour1)) {
				// console.log('not allowed wit neighbour', 1);
				return false;
			}
		}
		const neighbour2 = this._quadGraph.neighbour(quadNodeId, 2);
		if (neighbour2) {
			if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, neighbour2)) {
				// console.log('not allowed wit neighbour', 2);
				return false;
			}
		}
		const neighbour3 = this._quadGraph.neighbour(quadNodeId, 3);
		if (neighbour3) {
			if (!this._isConfigAllowedWithNeighbour(quadNodeId, tileConfig, neighbour3)) {
				// console.log('not allowed wit neighbour', 3);
				return false;
			}
		}

		return true;
	}
	private _isConfigAllowedWithNeighbour(quadNodeId: number, tileConfig: TileConfig, neighbour: QuadNode): boolean {
		// for (let sideIndex = 0; sideIndex < 4; sideIndex++) {
		// 	const neighbour = this._quadGraph.neighbour(quadNodeId, sideIndex);
		// 	if (!neighbour) {
		// 		console.log('no neighbour', quadNodeId, sideIndex);
		// 		continue;
		// 	}
		// console.log('yes neighbour', quadNodeId, neighbour.id);
		const isCollapsedTile = this._collapsedTileConfigByQuadId.has(neighbour.id);
		// console.log('collapsedState', quadNodeId, neighbour.id, collapsedState);
		if (isCollapsedTile) {
			const collapsedTile = this._collapsedTileConfigByQuadId.get(neighbour.id);
			if (collapsedTile == null) {
				// config is allowed if the tile is empty
				return true;
			}
			const isAllowed = this._tilesCollection.allowedTileConfig(
				tileConfig.tileId,
				tileConfig.lookAtSide,
				collapsedTile.tileId,
				collapsedTile.lookAtSide,
				this._quadGraph.cardinality(neighbour.id, quadNodeId)
			);
			if (isAllowed) {
				return true;
			}
		} else {
			const neighbourAllowedTileConfigs = this._allowedTileConfigsByQuadId.get(neighbour.id);
			if (neighbourAllowedTileConfigs && neighbourAllowedTileConfigs.length) {
				for (const neighbourTileConfig of neighbourAllowedTileConfigs) {
					const isAllowed = this._tilesCollection.allowedTileConfig(
						tileConfig.tileId,
						tileConfig.lookAtSide,
						neighbourTileConfig.tileId,
						neighbourTileConfig.lookAtSide
					);
					if (isAllowed) {
						return true;
					}
				}
			}
		}
		// }
		return false;
	}

	private _quadNodeWithLowestEntropy(seed: number, target: TileCorners) {
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

		target.p0.fromArray(this._quadPositionArray, quadNode.indices[0] * 3);
		target.p1.fromArray(this._quadPositionArray, quadNode.indices[3] * 3);
		target.p2.fromArray(this._quadPositionArray, quadNode.indices[2] * 3);
		target.p3.fromArray(this._quadPositionArray, quadNode.indices[1] * 3);

		return quadNode;
	}
}
