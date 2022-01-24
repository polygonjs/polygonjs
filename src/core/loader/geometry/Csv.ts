import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreAttributeData} from '../../geometry/AttributeData';
import {CoreAttribute} from '../../geometry/Attribute';
import {AttribType} from '../../geometry/Constant';
import {CoreGeometry} from '../../geometry/Geometry';
import {CoreType} from '../../Type';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {CoreBaseLoader} from '../_Base';

type CsvValue = string | number | number[];
const POSITION = 'position';

export class CsvLoader extends CoreBaseLoader {
	static SEPARATOR = ',';
	static VECTOR_SEPARATOR = ',';

	private attribute_names_from_first_line: boolean = false;
	private lines: string[] = [];
	private points_count: number = 0;
	private attribute_values_by_name: PolyDictionary<CsvValue[]> = {};
	// const attribute_types_by_name: PolyDictionary<AttribType> = {};
	// const attribute_sizes_by_name: PolyDictionary<1|2|3|4> = {};
	private attribute_data_by_name: PolyDictionary<CoreAttributeData> = {};
	private _loading = false;

	constructor(
		url: string,
		scene: PolyScene,
		private attribute_names?: string[],
		protected override _node?: BaseNodeType
	) {
		super(url, scene, _node);
		if (!this.attribute_names) {
			this.attribute_names_from_first_line = true;
		}
	}
	async load() {
		// we need to check if it is currently loading, as we accumulate the points_count durig read.
		// If another load was to start before the first load is completed, the points_count would be messed up.
		if (this._loading) {
			console.warn('is already loading');
			return;
		}
		this._loading = true;
		this.points_count = 0;
		await this.loadData();
		this.infer_types();
		this.read_values();
		const geometry = this.create_points();
		return geometry;
	}

	private async loadData() {
		const url = await this._urlToLoad();
		const response = await fetch(url);
		const text = await response.text();
		this.lines = text.split('\n');

		if (!this.attribute_names) {
			this.attribute_names = this.lines[0].split(CsvLoader.SEPARATOR);
		}
		this.attribute_names = this.attribute_names.map((name) => CoreAttribute.remapName(name));
		for (let attribute_name of this.attribute_names) {
			this.attribute_values_by_name[attribute_name] = [];
		}
	}

	private infer_types() {
		const first_values_index = this.attribute_names_from_first_line ? 1 : 0;
		const first_line = this.lines[first_values_index];
		let line_attribute_values = first_line.split(CsvLoader.SEPARATOR);
		for (let i = 0; i < line_attribute_values.length; i++) {
			const attribute_name = this.attribute_names![i];
			const attribute_value = line_attribute_values[i];
			const value = this._value_from_line_element(attribute_value);
			this.attribute_data_by_name[attribute_name] = CoreAttributeData.from_value(value);
		}
	}
	private _value_from_line_element(attribute_value: number | string) {
		if (CoreType.isString(attribute_value)) {
			if (`${parseFloat(attribute_value)}` === attribute_value) {
				return parseFloat(attribute_value);
			} else if (attribute_value[0] === '[' && attribute_value[attribute_value.length - 1] === ']') {
				const attribute_value_within_brackets = attribute_value.substring(1, attribute_value.length - 1);
				const elements_s = attribute_value_within_brackets.split(CsvLoader.VECTOR_SEPARATOR);
				return elements_s.map((element_s) => parseFloat(element_s));
			} else {
				return attribute_value;
			}
		} else {
			return attribute_value;
		}
	}
	read_values() {
		if (!this.attribute_names) {
			return;
		}
		const first_values_index = this.attribute_names_from_first_line ? 1 : 0;
		let line: string;
		for (let line_index = first_values_index; line_index < this.lines.length; line_index++) {
			line = this.lines[line_index];
			const line_attribute_values = line.split(CsvLoader.SEPARATOR);

			if (line_attribute_values.length >= this.attribute_names.length) {
				// ensure we are not on an empty line
				for (let i = 0; i < line_attribute_values.length; i++) {
					const attribute_name = this.attribute_names[i];
					if (attribute_name) {
						const attribute_value = line_attribute_values[i];
						const value = this._value_from_line_element(attribute_value);
						this.attribute_values_by_name[attribute_name].push(value);
					}
				}
				this.points_count += 1;
			}
		}

		// create position if not present in data
		if (!this.attribute_values_by_name[POSITION]) {
			const positions: number[] = new Array(this.points_count * 3);
			positions.fill(0);
			this.attribute_values_by_name[POSITION] = positions;
			this.attribute_data_by_name[POSITION] = new CoreAttributeData(3, AttribType.NUMERIC);
			this.attribute_names.push(POSITION);
		}
	}
	create_points() {
		if (!this.attribute_names) {
			return;
		}
		// create geometry
		const geometry = new BufferGeometry();
		const core_geometry = new CoreGeometry(geometry);
		for (let attribute_name of this.attribute_names) {
			const attribute_values = this.attribute_values_by_name[attribute_name].flat();
			const size = this.attribute_data_by_name[attribute_name].size();
			const type = this.attribute_data_by_name[attribute_name].type();
			if (type == AttribType.STRING) {
				const index_data = CoreAttribute.arrayToIndexedArrays(attribute_values as string[]);
				core_geometry.setIndexedAttribute(attribute_name, index_data['values'], index_data['indices']);
			} else {
				geometry.setAttribute(attribute_name, new Float32BufferAttribute(attribute_values as number[], size));
			}
		}

		// add index
		const indices: number[] = new Array(this.points_count);
		for (let i = 0; i < this.points_count; i++) {
			indices.push(i);
		}
		geometry.setIndex(indices);

		return geometry;
	}
}
