/**
 * Transform 2D CSG points and curves
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgGeometryType} from '../../../core/geometry/modules/csg/CsgCommon';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {CsgObject} from '../../../core/geometry/modules/csg/CsgObject';
import {MathUtils, Vector3, Euler, Quaternion, Matrix4} from 'three';

const _t = new Vector3();
const _r = new Vector3();
const _euler = new Euler();
const _q = new Quaternion();
const _s = new Vector3();
const _mat4 = new Matrix4();

class CSGTransform2DSopParamsConfig extends NodeParamsConfig {
	/** @param translate */
	t = ParamConfig.VECTOR2([0, 0]);
	/** @param rotation */
	r = ParamConfig.FLOAT(0, {
		range: [-180, 180],
		rangeLocked: [false, false],
	});
	/** @param scale (as a float) */
	s = ParamConfig.FLOAT(1, {
		range: [0, 2],
		step: 0.01,
	});
	/** @param pivot */
	// pivot = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CSGTransform2DSopParamsConfig();

export class CSGTransform2DSopNode extends CSGSopNode<CSGTransform2DSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): SopType.CSG_TRANSFORM_2D {
		return SopType.CSG_TRANSFORM_2D;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];

		const newObjects: CsgObject<CsgGeometryType>[] = [];
		const csgObjects = coreGroup0.csgObjects();
		if (csgObjects) {
			_t.set(this.pv.t.x, 0, this.pv.t.y);
			_r.set(0, this.pv.r, 0).multiplyScalar(MathUtils.DEG2RAD);
			_euler.y = _r.y;
			_q.setFromEuler(_euler);
			_s.set(1, 1, 1).multiplyScalar(this.pv.s);
			_mat4.compose(_t, _q, _s);

			for (const csgObject of csgObjects) {
				csgObject.applyMatrix4(_mat4);
				newObjects.push(csgObject);
			}
		}

		this.setCSGObjects(newObjects);
	}
}
