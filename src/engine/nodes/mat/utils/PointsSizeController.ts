import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export function PointsParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		size = ParamConfig.FLOAT(1, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		sizeAttenuation = ParamConfig.BOOLEAN(1, {
			separatorAfter: true,
		});
	};
}
class PointsParamsConfig extends PointsParamConfig(NodeParamsConfig) {}

class PointsMatNode extends TypedMatNode<PointsMaterial, PointsParamsConfig> {
	createMaterial() {
		return new PointsMaterial();
	}
}

export class PointsSizeController extends BaseController {
	constructor(protected override node: PointsMatNode) {
		super(node);
	}
	static update(node: PointsMatNode) {
		const material = node.material;
		const pv = node.pv;
		material.size = pv.size;
		const previousSizeAttenuation = material.sizeAttenuation;
		const newSizeAttenuation = isBooleanTrue(pv.sizeAttenuation);
		if (previousSizeAttenuation != newSizeAttenuation) {
			material.sizeAttenuation = newSizeAttenuation;
			material.needsUpdate = true;
		}
	}
}
