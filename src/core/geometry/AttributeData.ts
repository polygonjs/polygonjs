import lodash_isArray from 'lodash/isArray'
import lodash_isString from 'lodash/isString'
import {CoreConstant} from './Constant'

export class CoreAttributeData {
	constructor(private _size: number, private _type: number) {}

	size() {
		return this._size
	}
	type() {
		return this._type
	}

	static from_value(attrib_value: any) {
		const type = lodash_isString(attrib_value)
			? CoreConstant.ATTRIB_TYPE.STRING
			: CoreConstant.ATTRIB_TYPE.NUMERIC
		const size = lodash_isArray(attrib_value) ? attrib_value.length : 1

		return new this(size, type)
	}
}
