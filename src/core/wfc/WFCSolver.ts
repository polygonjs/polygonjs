import {Object3D} from 'three';
import {WFCTilesCollection} from './WFCTilesCollection';
import {WFCGrid} from './WFCGrid';
import {TileCorners} from './WFCCommon';
import {Vector3, Mesh} from 'three';
import {CoreObject} from '../geometry/Object';
import {tileCubeLatticeDeform} from './WFCTileDeform';

const tileCorners: TileCorners = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
	height: 1,
};

export class WFCSolver {
	private _objects: Object3D[] = [];
	constructor(private _grid: WFCGrid, private _collection: WFCTilesCollection, public readonly height: number) {}

	step(seed: number) {
		const quadNodeWithLowestEntropy = this._grid.quadNodeWithLowestEntropy(seed, tileCorners);
		const templateTileObject = this._collection.tiles()[0];
		if (!templateTileObject) {
			return;
		}
		const tileObject = CoreObject.clone(templateTileObject);
		tileCorners.height = this.height;
		tileObject.traverse((child) => {
			const geometry = (child as Mesh).geometry;
			if (!geometry) {
				return;
			}
			console.log(tileCorners);
			tileCubeLatticeDeform(child, tileCorners);
		});
		this._objects.push(tileObject);

		console.log(quadNodeWithLowestEntropy, tileObject, tileCorners);
	}
	objects(): Object3D[] {
		return this._objects;
	}
}
