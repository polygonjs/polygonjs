import {Poly} from '../../../Poly';

export class PolyPlugin {
	constructor(private _name: string, private _callback: (poly: Poly) => void) {}

	name() {
		return this._name;
	}

	init(poly: Poly) {
		this._callback(poly);
	}
}
