// // import {Core} from 'src/Core/_Module';
// import lodash_isArray from 'lodash/isArray'
// import lodash_isObject from 'lodash/isObject'
// import lodash_flatten from 'lodash/flatten'
// import {Points} from 'three/src/objects/Points'
// import {Float32BufferAttribute} from 'three/src/core/BufferAttribute'
// import {BufferGeometry} from 'three/src/core/BufferGeometry'
// const THREE = {BufferGeometry, Float32BufferAttribute, Points}

// // import UrlLoader from '../UrlLoader';
// import axios from 'axios'
// import {CoreString} from 'src/core/String'
// import {CoreGeometry} from 'src/Core/Geometry/Geometry'
// import {CoreConstant} from 'src/Core/Geometry/Constant'
// import {CoreAttributeData} from 'src/Core/Geometry/AttributeData'
// import {CoreAttribute} from 'src/Core/Geometry/Attribute'

// const DEEP_ATTRIB_SEPARATOR = ':'

// export class JsonDataLoader {
// 	_json: object
// 	_attribute_datas_by_name: object
// 	private data_keys_prefix: string
// 	private skip_entries: string
// 	private do_convert: CssColumnsBoolean
// 	private convert_to_numeric: string

// 	constructor(private requester?: any) {
// 		this.data_keys_prefix = requester.json_data_keys_prefix()
// 		this.skip_entries = requester.json_skip_entries()
// 		this.do_convert = requester.json_convert()
// 		this.convert_to_numeric = requester.json_convert_to_numeric()
// 	}
// 	//

// 	load(url, success_callback, progress_callback, error_callback) {
// 		// const url_loader = new UrlLoader();
// 		// const start_time = performance.now();
// 		// const config = {
// 		// 	crossdomain: true
// 		// }
// 		axios.get(url).then((response) => {
// 			// const end_time = performance.now();

// 			this._json = response.data
// 			if (this.data_keys_prefix != null && this.data_keys_prefix != '') {
// 				this._json = this.get_prefixed_json(
// 					this._json,
// 					this.data_keys_prefix.split('.')
// 				)
// 			}
// 			const object = this.create_object()
// 			success_callback(object)
// 		})
// 	}

// 	get_prefixed_json(json: object, prefixes: string[]): object {
// 		if (prefixes.length == 0) {
// 			return json
// 		} else {
// 			const first_prefix = prefixes.shift()
// 			return this.get_prefixed_json(json[first_prefix], prefixes)
// 		}
// 	}

// 	set_json(json) {
// 		return (this._json = json)
// 	}

// 	create_object() {
// 		const geometry = new THREE.BufferGeometry()
// 		const core_geo = new CoreGeometry(geometry)

// 		if (this._json != null) {
// 			const points_count = this._json.length
// 			core_geo.init_position_attribute(points_count)

// 			this._find_attributes()
// 			// for(let attrib_name of Object.keys(this._attribute_names)){
// 			// 	const attrib_data = this._attribute_datas_by_name[attrib_name];
// 			// 	return core_geo.add_attribute(attrib_name, attrib_data);
// 			// }

// 			const convert_to_numeric_masks = CoreString.attrib_names(
// 				this.convert_to_numeric
// 			)

// 			// set values
// 			for (let attrib_name of Object.keys(
// 				this._attribute_datas_by_name
// 			)) {
// 				let attrib_values = lodash_flatten(
// 					this._attribute_values_for_name(attrib_name)
// 				)

// 				const data = this._attribute_datas_by_name[attrib_name]
// 				const size = data.size()

// 				if (data.type() === CoreConstant.ATTRIB_TYPE.STRING) {
// 					const index_data = CoreAttribute.array_to_indexed_arrays(
// 						attrib_values
// 					)

// 					if (
// 						this.do_convert &&
// 						CoreString.matches_one_mask(
// 							attrib_name,
// 							convert_to_numeric_masks
// 						)
// 					) {
// 						attrib_values = attrib_values.map(
// 							(v) => parseFloat(v) || 0
// 						)
// 						geometry.setAttribute(
// 							attrib_name,
// 							new THREE.Float32BufferAttribute(
// 								attrib_values,
// 								size
// 							)
// 						)
// 					} else {
// 						const index_data = CoreAttribute.array_to_indexed_arrays(
// 							attrib_values
// 						)
// 						core_geo.set_indexed_attribute(
// 							attrib_name,
// 							index_data['values'],
// 							index_data['indices']
// 						)
// 					}
// 				} else {
// 					geometry.setAttribute(
// 						attrib_name,
// 						new THREE.Float32BufferAttribute(attrib_values, size)
// 					)
// 				}
// 			}
// 		}
// 		return new THREE.Points(
// 			geometry,
// 			CoreConstant.MATERIALS[THREE.Points.name]
// 		)
// 	}

// 	_find_attributes() {
// 		let first_pt
// 		this._attribute_datas_by_name = {}

// 		const masks = CoreString.attrib_names(this.skip_entries)

// 		if ((first_pt = this._json[0]) != null) {
// 			for (let attrib_name of Object.keys(first_pt)) {
// 				const attrib_value = first_pt[attrib_name]

// 				if (this._value_has_subentries(attrib_value)) {
// 					for (let key of Object.keys(attrib_value)) {
// 						const deep_attrib_name = [attrib_name, key].join(
// 							DEEP_ATTRIB_SEPARATOR
// 						)
// 						const deep_attrib_value = attrib_value[attrib_name]

// 						if (
// 							!CoreString.matches_one_mask(
// 								deep_attrib_name,
// 								masks
// 							)
// 						) {
// 							this._attribute_datas_by_name[
// 								deep_attrib_name
// 							] = CoreAttributeData.from_value(deep_attrib_value)
// 						}
// 					}
// 				} else {
// 					if (!CoreString.matches_one_mask(attrib_name, masks)) {
// 						this._attribute_datas_by_name[
// 							attrib_name
// 						] = CoreAttributeData.from_value(attrib_value)
// 					}
// 				}
// 			}
// 		}
// 	}

// 	_attribute_values_for_name(attrib_name: string) {
// 		return this._json.map((json_element: ObjectsByString) => {
// 			const prefix = attrib_name.split(DEEP_ATTRIB_SEPARATOR)[0]
// 			const value = json_element[prefix]
// 			if (this._value_has_subentries(value)) {
// 				const deep_attrib_name = attrib_name.substring(
// 					prefix.length + 1
// 				)
// 				return value[deep_attrib_name] || 0
// 			} else {
// 				return value || 0
// 			}
// 		})
// 	}

// 	_value_has_subentries(value): boolean {
// 		return lodash_isObject(value) && !lodash_isArray(value)
// 	}
// }
