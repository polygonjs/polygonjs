import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/Engine/Poly'

export class Cop extends BaseManager {
	static type(){return 'cop'}
	children_context(){ return NodeContext.COP }

	constructor() {
		super();
		this._init_manager();
	}
}



