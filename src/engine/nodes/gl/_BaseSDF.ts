import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

const VARS = {
	position: 'p',
};
class BaseSDFGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
}

export class BaseSDFGlNode<K extends BaseSDFGlParamsConfig> extends TypedGlNode<K> {
	protected position() {
		const inputPosition = this.io.inputs.named_input(this.p.position.name());
		const position = inputPosition
			? ThreeToGl.float(this.variableForInputParam(this.p.position))
			: this._defaultPosition();
		return position;
	}
	private _defaultPosition(): string {
		return VARS.position;
	}
}
