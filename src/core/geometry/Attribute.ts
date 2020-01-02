import {Vector3} from 'three/src/math/Vector3'
import {Vector2} from 'three/src/math/Vector2'
const THREE = {Vector2, Vector3}

const ATTRIB_NAME_MAP: StringsByString = {
	P: 'position',
	N: 'normal',
	Cd: 'color',
}

export class CoreAttribute {
	// constructor: (@_size, @_value)->
	// 	#

	// size: ->
	// 	@_size

	// value: ->
	// 	@_value

	// set_value: (value)->
	// 	@_value = value

	static remap_name(name: string): string {
		return ATTRIB_NAME_MAP[name] || name
	}

	static array_to_indexed_arrays(array: number[]) {
		let data
		const index_by_value: NumbersByString = {}
		let current_index = 0
		const indices = []
		const values = []

		let i = 0
		while (i < array.length) {
			//(value = array[i++])?
			const value = array[i]
			const index = index_by_value[value]
			if (index != null) {
				indices.push(index)
			} else {
				values.push(value)
				indices.push(current_index)
				index_by_value[value] = current_index
				current_index += 1
			}

			i++
		}

		return (data = {
			indices,
			values,
		})
	}

	static default_value(size: number) {
		switch (size) {
			case 1:
				return 0
			case 2:
				return new THREE.Vector2(0, 0)
			case 3:
				return new THREE.Vector3(0, 0, 0)
			default:
				throw `size ${size} not yet implemented`
		}
	}
}
