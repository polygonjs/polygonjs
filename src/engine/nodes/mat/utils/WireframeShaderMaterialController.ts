import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export function WireframeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to set material to wireframe */
		wireframe = ParamConfig.BOOLEAN(0);
	};
}

class WireframeParamsConfig extends WireframeParamConfig(NodeParamsConfig) {}
class WireframedMatNode extends TypedMatNode<ShaderMaterial, WireframeParamsConfig> {
	createMaterial() {
		return new ShaderMaterial();
	}
}

export class WireframeController extends BaseController {
	constructor(protected node: WireframedMatNode) {
		super(node);
	}
	static update(node: WireframedMatNode) {
		const material = node.material;
		const pv = node.pv;

		material.wireframe = isBooleanTrue(pv.wireframe);
		material.needsUpdate = true;
	}
}
