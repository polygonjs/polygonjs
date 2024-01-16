import {isString,isArray} from '../Type';
import {AttribType} from './Constant';

export class CoreAttributeData {
	constructor(private _size: number, private _type: AttribType) {}

	size() {
		return this._size;
	}
	type() {
		return this._type;
	}

	static from_value(attrib_value: any) {
		const type = isString(attrib_value) ? AttribType.STRING : AttribType.NUMERIC;
		const size = isArray(attrib_value) ? attrib_value.length : 1;

		return new this(size, type);
	}
}
