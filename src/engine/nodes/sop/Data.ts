/**
 * Create points from a an array of json dictionaries
 *
 * @remarks
 * The number of points created will be equal to the number of elements in the array.
 * Each element of the array must be a dictionary. It can look like:
 * `[{position: [1,2,3]}]`
 * which will create a single point at the position x=1,y=2,z=3.
 *
 * In order to create 2 points with attributes `position` and `amp`, you would have:
 * `[{position: [1,2,3], amp: 1},{position: [7,2,1], amp: 3}]`
 *
 */
import {TypedSopNode} from './_Base';
import {JsonDataLoader} from '../../../core/loader/geometry/JsonData';

const DEFAULT_DATA = [
	{value: -40},
	{value: -30},
	{value: -20},
	{value: -10},
	{value: 0},
	{value: 10},
	{value: 20},
	{value: 30},
	{value: 40},
	{value: 50},
	{value: 60},
	{value: 70},
	{value: 80},
];
const DEFAULT_DATA_STR = JSON.stringify(DEFAULT_DATA);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ObjectType} from '../../../core/geometry/Constant';
class DataSopParamsConfig extends NodeParamsConfig {
	/** @param json object used to create the geometry */
	data = ParamConfig.STRING(DEFAULT_DATA_STR);
}
const ParamsConfig = new DataSopParamsConfig();

export class DataSopNode extends TypedSopNode<DataSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'data';
	}

	cook() {
		let json = null;
		try {
			json = JSON.parse(this.pv.data);
		} catch (e) {
			this.states.error.set('could not parse json');
		}

		if (json) {
			try {
				const loader = new JsonDataLoader();
				loader.set_json(json);
				const geometry = loader.create_object();
				this.set_geometry(geometry, ObjectType.POINTS);
			} catch (e) {
				this.states.error.set('could not build geometry from json');
			}
		} else {
			this.cook_controller.end_cook();
		}
	}
}
