/**
 * Create a CSG dodecahedron
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {primitives, booleans, utils, transforms, maths} from '@jscad/modeling';
const {cuboid} = primitives;
const {intersect} = booleans;
const {rotateX, rotateZ, scale} = transforms;
const {degToRad} = utils;

const dodecahedron = (h: number) => {
	let cuboid1 = cuboid({size: [20, 20, 10]});
	for (let i = 0; i <= 4; i++) {
		// loop i from 0 to 4, and intersect results
		// make a cube, rotate it 116.565 degrees around the X axis,
		// then 72*i around the Z axis
		cuboid1 = intersect(
			cuboid1,
			rotateZ(i * degToRad(72), rotateX(degToRad(116.565), cuboid({size: [20, 20, 10]})))
		);
	}
	return scale([h, h, h], cuboid1); // scale by height parameter
};

class CSGDodecahedronSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [maths.constants.EPS, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CSGDodecahedronSopParamsConfig();

export class CSGDodecahedronSopNode extends CSGSopNode<CSGDodecahedronSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_DODECAHEDRON;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const object = dodecahedron(this.pv.radius * 0.1);
		this.setCSGGeometry(object);
	}
}
