import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/Engine/Poly'

export class Events extends BaseManager {
	static type() { return 'events'; }
	children_context(){ return NodeContext.EVENT }

	constructor() {
		super();
		this._init_manager();
	}

}

