/**
 * Computes the hull of the input CSG geometries
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CsgGeometry} from '../../../core/geometry/modules/csg/CsgCommon';
import {csgIsPath2, csgIsGeom2, csgIsGeom3} from '../../../core/geometry/modules/csg/CsgCoreType';
import {geom2ApplyTransforms} from '../../../core/geometry/modules/csg/math/CsgMat4';
import {hulls, geometries} from '@jscad/modeling';
const {hull, hullChain} = hulls;

class CSGHullSopParamsConfig extends NodeParamsConfig {
	/** @param chain */
	chain = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new CSGHullSopParamsConfig();

export class CSGHullSopNode extends CSGSopNode<CSGHullSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_HULL;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const geom3: geometries.geom3.Geom3[] = [];
		const geom2: geometries.geom2.Geom2[] = [];
		const path2: geometries.path2.Path2[] = [];
		const objects = inputCoreGroups[0].csgObjects();
		if (objects) {
			for (const object of objects) {
				const geometry = object.csgGeometry();
				if (csgIsGeom3(geometry)) {
					geom3.push(geometry);
				}
				if (csgIsGeom2(geometry)) {
					// the transforms are applied for geom2
					geom2ApplyTransforms(geometry);
					geom2.push(geometry);
				}
				if (csgIsPath2(geometry)) {
					path2.push(geometry);
				}
			}

			// add the first element to the list if there is only a single element
			if (geom3.length == 1) {
				geom3.push(geom3[0]);
			}
			if (geom2.length == 1) {
				geom2.push(geom2[0]);
			}
			if (path2.length == 1) {
				path2.push(path2[0]);
			}

			const method = this.pv.chain ? hullChain : hull;
			const newGeometries: CsgGeometry[] = [];
			if (geom3.length >= 2) {
				newGeometries.push(method(geom3));
			}
			if (geom2.length >= 2) {
				newGeometries.push(method(geom2));
			}
			if (path2.length >= 2) {
				newGeometries.push(method(path2));
			}
			this.setCSGGeometries(newGeometries);
		} else {
			this.setCSGObjects([]);
		}
	}
}
