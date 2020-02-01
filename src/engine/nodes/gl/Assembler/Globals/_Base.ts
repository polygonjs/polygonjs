import {_Math} from 'three/src/math/Math'
const THREE = {Math:_Math}

export class GlobalsBaseController {

	private _id: string

	constructor(){
		this._id = THREE.Math.generateUUID()
	}
	id(){
		return this._id
	}
}