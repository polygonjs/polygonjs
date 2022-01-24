import {BaseMatNodeType} from '../_Base';

export class BaseController {
	constructor(protected node: BaseMatNodeType) {}
	// add_params() {}

	update() {}

	get material() {
		return this.node.material;
	}
}
