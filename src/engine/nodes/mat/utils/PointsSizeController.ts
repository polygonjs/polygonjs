import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {Material, PointsMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export interface PointsSizeControllers {
	pointsSize: PointsSizeController;
}
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

function isValidMaterial(material?: Material): material is PointsMaterial {
	if (!material) {
		return false;
	}
	return (material as PointsMaterial).size != null;
}
class PointsSizeMatNode extends TypedMatNode<PointsMaterial, PointsParamsConfig> {
	async material() {
		const container = await this.compute();
		return container.material() as PointsMaterial | undefined;
	}
	controllers!: PointsSizeControllers;
}

export class PointsSizeController extends BaseController {
	constructor(protected override node: PointsSizeMatNode) {
		super(node);
	}
	static async update(node: PointsSizeMatNode) {
		const material = await node.material();
		if (!isValidMaterial(material)) {
			return;
		}
		node.controllers.pointsSize.updateMaterial(material);
	}
	override updateMaterial(material: PointsMaterial) {
		const pv = this.node.pv;
		material.size = pv.size;
		const previousSizeAttenuation = material.sizeAttenuation;
		const newSizeAttenuation = isBooleanTrue(pv.sizeAttenuation);
		if (previousSizeAttenuation != newSizeAttenuation) {
			material.sizeAttenuation = newSizeAttenuation;
			material.needsUpdate = true;
		}
	}
}
