import {LineBasicMaterial, LineSegments, Object3D, Points, PointsMaterial} from 'three';
import {PDBLoader} from '../../../modules/three/examples/jsm/loaders/PDBLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';
import type {PDB} from '../../../modules/three/examples/jsm/loaders/PDBLoader';

const matPoints = new PointsMaterial();
const matLines = new LineBasicMaterial();

export class PDBLoaderHandler extends BaseGeoLoaderHandler<PDB> {
	protected async _getLoader(): Promise<BaseGeoLoader<PDB>> {
		return (this._loader = this._loader || (await new PDBLoader(this.loadingManager)));
	}
	protected override _onLoadSuccess(o: PDB): Object3D[] {
		const atoms = new Points(o.geometryAtoms, matPoints);
		const bonds = new LineSegments(o.geometryBonds, matLines);

		return [atoms, bonds];
	}
}
