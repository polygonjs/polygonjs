/**
 * Extrude the geometry in a rectangle
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {hulls, geometries} from '@jscad/modeling';
import {CsgObject} from '../../../core/geometry/csg/CsgCoreObject';
import {geom2ApplyTransforms} from '../../../core/geometry/csg/math/CsgMat4';
const {hull, hullChain} = hulls;

class HullCsgParamsConfig extends NodeParamsConfig {
	/** @param chain */
	chain = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new HullCsgParamsConfig();

export class HullCsgNode extends TypedCsgNode<HullCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'hull';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const geom3: geometries.geom3.Geom3[] = [];
		const geom2: geometries.geom2.Geom2[] = [];
		const path2: geometries.path2.Path2[] = [];
		const objects = inputCoreGroups[0].objects();
		for (let object of objects) {
			if (geometries.geom3.isA(object)) {
				geom3.push(object);
			}
			if (geometries.geom2.isA(object)) {
				// the transforms are applied for geom2
				geom2ApplyTransforms(object);
				geom2.push(object);
			}
			if (geometries.path2.isA(object)) {
				path2.push(object);
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
		const newObjects: CsgObject[] = [];
		if (geom3.length >= 2) {
			newObjects.push(method(geom3));
		}
		if (geom2.length >= 2) {
			newObjects.push(method(geom2));
		}
		if (path2.length >= 2) {
			newObjects.push(method(path2));
		}
		this.setCsgCoreObjects(newObjects);
	}
}
