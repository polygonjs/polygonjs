export class CoreEntity {
	constructor(protected _index: number) {}
	get index() {
		return this._index;
	}
}
