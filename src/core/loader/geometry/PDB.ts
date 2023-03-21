import {LineBasicMaterial, LineSegments, Object3D, Points, PointsMaterial} from 'three';
import {PDBLoader} from 'three/examples/jsm/loaders/PDBLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';
import type {PDB} from 'three/examples/jsm/loaders/PDBLoader';

const matPoints = new PointsMaterial();
const matLines = new LineBasicMaterial();

export class PDBLoaderHandler extends BaseObject3DLoaderHandler<PDB> {
	protected async _getLoader(): Promise<BaseGeoLoader<PDB>> {
		return (this._loader = this._loader || (await new PDBLoader(this.loadingManager)));
	}
	protected override _onLoadSuccess(o: PDB): Object3D[] {
		const atoms = new Points(o.geometryAtoms, matPoints);
		const bonds = new LineSegments(o.geometryBonds, matLines);

		return [atoms, bonds];
	}
}
