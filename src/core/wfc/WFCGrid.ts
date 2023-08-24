import {QuadObject} from '../geometry/quad/QuadObject';
import {QuadGraph} from '../graph/quad/QuadGraph';
import {Vector4} from 'three';
import {Number4} from '../../types/GlobalTypes';
import {QuadNode} from '../graph/quad/QuadNode';
import {pushOnArrayAtEntry} from '../MapUtils';
import {spliceSample} from '../ArrayUtils';
import {Attribute} from '../geometry/Attribute';
import {TileCorners} from './WFCCommon';

const _v4 = new Vector4();
// The QuadGraph is only a representation of the quads, and is therefore not aware of Z tiles.
// But the WFCGrid knows about the entropy of tiles in higher Z positions.

export class WFCGrid {
	private _positionArray: number[];
	private _quadGraph: QuadGraph = new QuadGraph();
	private _lowestEntropy: number = Number.POSITIVE_INFINITY;
	private _quadNodeByEntropy: Map<number, QuadNode[]> = new Map();
	constructor(public readonly object: QuadObject) {
		this._positionArray = this.object.geometry.attributes[Attribute.POSITION].array;
		const quadsCount = object.geometry.quadsCount();
		const index = object.geometry.index;
		for (let i = 0; i < quadsCount; i++) {
			_v4.fromArray(index, i * 4);
			const quadNode = this._quadGraph.addQuad(i, _v4.toArray() as Number4);
			// we assume for now that the entropy is the same for all quads, Infinity
			const entropy = Number.POSITIVE_INFINITY;

			pushOnArrayAtEntry(this._quadNodeByEntropy, entropy, quadNode);
		}
	}
	quadNodeWithLowestEntropy(seed: number, target: TileCorners) {
		const quadNodes = this._quadNodeByEntropy.get(this._lowestEntropy);
		if (!quadNodes) {
			return;
		}
		const quadNode = spliceSample(quadNodes, seed);
		if (!quadNode) {
			return;
		}

		// update lowest entropy if needed
		if (quadNodes.length == 0) {
			this._quadNodeByEntropy.delete(this._lowestEntropy);
			this._quadNodeByEntropy.forEach((quadNodes, entropy) => {
				if (entropy < this._lowestEntropy) {
					this._lowestEntropy = entropy;
				}
			});
		}

		target.p0.fromArray(this._positionArray, quadNode.quad[0] * 3);
		target.p1.fromArray(this._positionArray, quadNode.quad[3] * 3);
		target.p2.fromArray(this._positionArray, quadNode.quad[2] * 3);
		target.p3.fromArray(this._positionArray, quadNode.quad[1] * 3);

		return quadNode;
	}
}
