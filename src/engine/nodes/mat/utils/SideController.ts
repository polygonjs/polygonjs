import {BaseController} from './_BaseController';

import {FrontSide} from 'three/src/constants';
import {DoubleSide} from 'three/src/constants';
import {BackSide} from 'three/src/constants';

export class SideController extends BaseController {
	add_params() {
		this.node.add_param(ParamType.BOOLEAN, 'double_sided', 0);
		this.node.add_param(ParamType.BOOLEAN, 'front', 1, {visible_if: {double_sided: false}});
	}

	update() {
		this.material.side = this._param_double_sided ? DoubleSide : this._param_front ? FrontSide : BackSide;
	}

	get _param_front() {
		return this.node.params.boolean('front');
	}
	get _param_double_sided() {
		return this.node.params.boolean('double_sided');
	}
}
