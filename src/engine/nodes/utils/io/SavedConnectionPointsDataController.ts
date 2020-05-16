import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {BaseConnectionPointData} from './connections/_Base';

export class SavedConnectionPointsDataController<NC extends NodeContext> {
	private _in: BaseConnectionPointData[] | undefined;
	private _out: BaseConnectionPointData[] | undefined;

	constructor(protected _node: TypedNode<NC, any>) {}

	set_in(data: BaseConnectionPointData[]) {
		this._in = data;
	}
	set_out(data: BaseConnectionPointData[]) {
		this._out = data;
	}
	clear() {
		this._in = undefined;
		this._out = undefined;
	}
	in() {
		return this._in;
	}
	out() {
		return this._out;
	}
}
