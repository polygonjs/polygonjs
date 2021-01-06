// import {Core} from '../../_Module';
import {Points} from 'three/src/objects/Points';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
const THREE = {BufferGeometry, Float32BufferAttribute, Points};

import {CoreString} from '../../String';
import {CoreGeometry} from '../../geometry/Geometry';
import {AttribType} from '../../geometry/Constant';
import {CoreAttributeData} from '../../geometry/AttributeData';
import {CoreAttribute} from '../../geometry/Attribute';
import {Poly} from '../../../engine/Poly';
import {CoreType} from '../../Type';
import {ObjectUtils} from '../../ObjectUtils';
import {PolyDictionary, StringOrNumber} from '../../../types/GlobalTypes';

const DEEP_ATTRIB_SEPARATOR = ':';

export interface JsonDataLoaderOptions {
	dataKeysPrefix?: string;
	skipEntries?: string;
	doConvert?: boolean;
	convertToNumeric?: string;
}

export class JsonDataLoader {
	_json: any[] | undefined;
	_attribute_datas_by_name: PolyDictionary<CoreAttributeData> = {};
	private _options: JsonDataLoaderOptions = {};

	constructor(options: JsonDataLoaderOptions = {}) {
		this._options.dataKeysPrefix = options.dataKeysPrefix;
		this._options.skipEntries = options.skipEntries;
		this._options.doConvert = options.doConvert || false;
		this._options.convertToNumeric = options.convertToNumeric;
	}
	//

	load(
		url: string,
		success_callback: (geometry: BufferGeometry) => void,
		progress_callback: (() => void) | undefined,
		error_callback: (error: ErrorEvent) => void | undefined
	) {
		// const url_loader = new UrlLoader();
		// const start_time = performance.now();
		// const config = {
		// 	crossdomain: true
		// }
		fetch(url)
			.then(async (response) => {
				// const end_time = performance.now();

				this._json = await response.json();
				if (this._options.dataKeysPrefix != null && this._options.dataKeysPrefix != '') {
					this._json = this.get_prefixed_json(this._json, this._options.dataKeysPrefix.split('.'));
				}
				const object = this.create_object();
				success_callback(object);
			})
			.catch((error: ErrorEvent) => {
				Poly.error('error', error);
				error_callback(error);
			});
	}

	get_prefixed_json(json: any, prefixes: string[]): any[] {
		if (prefixes.length == 0) {
			return json;
		} else {
			const first_prefix = prefixes.shift();
			if (first_prefix) {
				return this.get_prefixed_json(json[first_prefix], prefixes);
			}
		}
		return [];
	}

	set_json(json: any) {
		return (this._json = json);
	}

	create_object() {
		const geometry = new THREE.BufferGeometry();
		const core_geo = new CoreGeometry(geometry);

		if (this._json != null) {
			const points_count = this._json.length;
			core_geo.initPositionAttribute(points_count);

			this._find_attributes();
			// for(let attrib_name of Object.keys(this._attribute_names)){
			// 	const attrib_data = this._attribute_datas_by_name[attrib_name];
			// 	return core_geo.addAttribute(attrib_name, attrib_data);
			// }

			const convert_to_numeric_masks = CoreString.attribNames(this._options.convertToNumeric || '');

			// set values
			for (let attrib_name of Object.keys(this._attribute_datas_by_name)) {
				const geo_attrib_name = CoreAttribute.remap_name(attrib_name);
				let attrib_values = this._attribute_values_for_name(attrib_name).flat();

				const data = this._attribute_datas_by_name[attrib_name];
				const size = data.size();

				if (data.type() === AttribType.STRING) {
					// const index_data = CoreAttribute.array_to_indexed_arrays(
					// 	attrib_values as string[]
					// )

					if (this._options.doConvert && CoreString.matchesOneMask(attrib_name, convert_to_numeric_masks)) {
						const numerical_attrib_values: number[] = attrib_values.map((v) => {
							if (CoreType.isString(v)) {
								return parseFloat(v) || 0;
							} else {
								return v;
							}
						});
						geometry.setAttribute(
							geo_attrib_name,
							new THREE.Float32BufferAttribute(numerical_attrib_values, size)
						);
					} else {
						const index_data = CoreAttribute.array_to_indexed_arrays(attrib_values as string[]);
						core_geo.setIndexedAttribute(geo_attrib_name, index_data['values'], index_data['indices']);
					}
				} else {
					const numerical_attrib_values = attrib_values as number[];
					geometry.setAttribute(
						geo_attrib_name,
						new THREE.Float32BufferAttribute(numerical_attrib_values, size)
					);
				}
			}
		}
		return geometry;
		// return new THREE.Points(geometry, CoreConstant.MATERIALS[THREE.Points.name]);
	}

	private _find_attributes() {
		let first_pt;

		const masks = CoreString.attribNames(this._options.skipEntries || '');

		if (this._json) {
			if ((first_pt = this._json[0]) != null) {
				for (let attrib_name of Object.keys(first_pt)) {
					const attrib_value = first_pt[attrib_name];

					if (this._value_has_subentries(attrib_value)) {
						for (let key of Object.keys(attrib_value)) {
							const deep_attrib_name = [attrib_name, key].join(DEEP_ATTRIB_SEPARATOR);
							const deep_attrib_value = attrib_value[attrib_name];

							if (!CoreString.matchesOneMask(deep_attrib_name, masks)) {
								this._attribute_datas_by_name[deep_attrib_name] = CoreAttributeData.from_value(
									deep_attrib_value
								);
							}
						}
					} else {
						if (!CoreString.matchesOneMask(attrib_name, masks)) {
							this._attribute_datas_by_name[attrib_name] = CoreAttributeData.from_value(attrib_value);
						}
					}
				}
			}
		}
	}

	private _attribute_values_for_name(attrib_name: string): StringOrNumber[] {
		if (this._json) {
			return this._json.map((json_element: PolyDictionary<any>) => {
				const prefix = attrib_name.split(DEEP_ATTRIB_SEPARATOR)[0];
				const value = json_element[prefix];
				if (this._value_has_subentries(value)) {
					const deep_attrib_name = attrib_name.substring(prefix.length + 1);
					return value[deep_attrib_name] || 0;
				} else {
					return value || 0;
				}
			});
		} else {
			return [];
		}
	}

	_value_has_subentries(value: any): boolean {
		return ObjectUtils.isObject(value) && !CoreType.isArray(value);
	}
}
