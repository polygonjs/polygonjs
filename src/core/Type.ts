export class CoreType {

	static isNumber(value: any): value is number{
		return typeof value == 'number'
	}
	static isString(value:any): value is string{
		return typeof value == 'string'
	}
	static isBoolean(value:any): value is boolean{
		return value === true || value === false
	}
	static isNaN(value:any): boolean{
		return isNaN(value)
	}
	static isArray(value:any): value is any[]{
		return Array.isArray(value)
	}

}