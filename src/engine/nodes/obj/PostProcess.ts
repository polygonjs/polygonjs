import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/Engine/Poly'

export class PostProcess extends BaseManager {
	static type() { return 'post_process'; }
	children_context(){ return NodeContext.POST }

	constructor() {
		super();
		this._init_manager();
	}
}



