/**
 * Transform the input
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadType} from '../../poly/registers/nodes/types/Cad';
import {Vector3} from 'three';

const tmpS = new Vector3();
// TODO: scale should use current t as pivit (maybe just scale before translate?)
// TODO: use a transform2D node that would have more sensible transform parameters
class TransformCadParamsConfig extends NodeParamsConfig {
	/** @param translate */
	t = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param rotation */
	r = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param scale */
	s = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param scale (as a float) */
	scale = ParamConfig.FLOAT(1, {
		range: [0, 2],
		step: 0.01,
	});
}
const ParamsConfig = new TransformCadParamsConfig();

export class TransformCadNode extends TypedCadNode<TransformCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): CadType.TRANSFORM {
		return CadType.TRANSFORM;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		// const oc = await CadLoader.core();
		const coreGroup0 = inputCoreGroups[0];

		tmpS.copy(this.pv.s).multiplyScalar(this.pv.scale);
		const objects = coreGroup0.objects();
		for (let object of objects) {
			object.transform(this.pv.t, this.pv.r, tmpS);
		}

		this.setCadObjects(objects);
	}
}
