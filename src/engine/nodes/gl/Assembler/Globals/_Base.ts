export class GlobalsBaseController {
	private static __next_id: number = 0;
	private _id: number;

	constructor() {
		this._id = GlobalsBaseController.__next_id++;
	}
	id() {
		return this._id;
	}
}
