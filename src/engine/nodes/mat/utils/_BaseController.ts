import {BaseMatNode} from '../_Base';

export class BaseController {
	constructor(protected node: BaseMatNode) {}
	add_params() {}

	update() {}

	get material() {
		return this.node.material;
	}
}
