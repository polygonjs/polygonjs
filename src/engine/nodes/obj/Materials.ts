import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/Engine/Poly'

export class Materials extends BaseManager {
	static type() { return 'materials'; }
	children_context(){ return NodeContext.MAT }

	constructor() {
		super();
		this._init_manager({
			children: {
				dependent: false
			}
		});

		// attempt to have the parent /MAT depend on children like /MAT/material1
		// but how would this method know which node has triggered?
		// this.add_post_dirty_hook(this._eval_all_params_on_dirty.bind(this))
	}
}



