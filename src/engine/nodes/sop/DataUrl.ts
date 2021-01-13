/**
 * Create points from a an array of json dictionaries
 *
 * @remarks
 * This node is similar to the [Data SOP], but will fetch the data from a url.
 *
 */
import {TypedSopNode} from './_Base';
import {JsonDataLoader} from '../../../core/loader/geometry/JsonData';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {CsvLoader} from '../../../core/loader/geometry/Csv';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ObjectType} from '../../../core/geometry/Constant';
import {ASSETS_ROOT} from '../../../../tests/helpers/AssetsUtils';

export enum DataType {
	JSON = 'json',
	CSV = 'csv',
}
export const DATA_TYPES: DataType[] = [DataType.JSON, DataType.CSV];

const DEFAULT_URL = `${ASSETS_ROOT}/nodes/sop/DataUrl/basic.json`;
class DataUrlSopParamsConfig extends NodeParamsConfig {
	/** @param sets if the data is interpreted as json or csv */
	dataType = ParamConfig.INTEGER(DATA_TYPES.indexOf(DataType.JSON), {
		menu: {
			entries: DATA_TYPES.map((t, i) => {
				return {
					name: t,
					value: i,
				};
			}),
		},
	});
	/** @param the url to fetch the data from */
	url = ParamConfig.STRING(DEFAULT_URL);

	//
	// JSON params
	//
	/** @param if the data is inside the payload, defines the prefix to read it from here */
	jsonDataKeysPrefix = ParamConfig.STRING('', {
		visibleIf: {dataType: DATA_TYPES.indexOf(DataType.JSON)},
	});
	/** @param which entries are skipped */
	skipEntries = ParamConfig.STRING('', {
		visibleIf: {dataType: DATA_TYPES.indexOf(DataType.JSON)},
	});
	/** @param sets if some attributes should be converted */
	convert = ParamConfig.BOOLEAN(0, {
		visibleIf: {dataType: DATA_TYPES.indexOf(DataType.JSON)},
	});
	/** @param sets which attributes should be converted from string to numeric */
	convertToNumeric = ParamConfig.STRING('', {
		visibleIf: {
			dataType: DATA_TYPES.indexOf(DataType.JSON),
			convert: 1,
		},
	});

	//
	// CSV params
	//
	/** @param when fetching from a csv, the attribute names will not be present. Those can then be mentioned here */
	readAttribNamesFromFile = ParamConfig.BOOLEAN(1, {
		visibleIf: {dataType: DATA_TYPES.indexOf(DataType.CSV)},
	});
	/** @param list of attributes names when fetching from a csv */
	attribNames = ParamConfig.STRING('height scale', {
		visibleIf: {
			dataType: DATA_TYPES.indexOf(DataType.CSV),
			readAttribNamesFromFile: 0,
		},
	});

	//
	// reload
	//
	/** @param reload the url */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			DataUrlSopNode.PARAM_CALLBACK_reload(node as DataUrlSopNode, param);
		},
	});
}
const ParamsConfig = new DataUrlSopParamsConfig();

export class DataUrlSopNode extends TypedSopNode<DataUrlSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'dataUrl';
	}

	async cook() {
		switch (DATA_TYPES[this.pv.dataType]) {
			case DataType.JSON:
				return this._load_json();
			case DataType.CSV:
				return this._load_csv();
		}
	}
	private _url() {
		const assets_root = this.scene().assets.root();
		if (assets_root) {
			return `${assets_root}${this.pv.url}`;
		} else {
			return this.pv.url;
		}
	}
	//
	//
	// JSON
	//
	//
	private _load_json() {
		const loader = new JsonDataLoader({
			dataKeysPrefix: this.pv.jsonDataKeysPrefix,
			skipEntries: this.pv.skipEntries,
			doConvert: this.pv.convert,
			convertToNumeric: this.pv.convertToNumeric,
		});

		loader.load(this._url(), this._on_load.bind(this), undefined, this._on_error.bind(this));
	}

	_on_load(geometry: BufferGeometry) {
		this.setGeometry(geometry, ObjectType.POINTS);
	}
	_on_error(error: ErrorEvent) {
		this.states.error.set(`could not load geometry from ${this._url()} (${error})`);
		this.cookController.end_cook();
	}

	//
	//
	// CSV
	//
	//
	async _load_csv() {
		const attribNames = this.pv.readAttribNamesFromFile ? undefined : this.pv.attribNames.split(' ');
		const loader = new CsvLoader(attribNames);
		const geometry = await loader.load(this._url());
		if (geometry) {
			this.setGeometry(geometry, ObjectType.POINTS);
		} else {
			this.states.error.set('could not generate points');
		}
	}

	// async _on_open_url(){
	// 	const url = await this.param('url').eval_p()
	// 	const a = document.createElement('a')
	// 	a.href = url
	// 	a.setAttribute('target', '_blank')
	// 	a.click()
	// }

	static PARAM_CALLBACK_reload(node: DataUrlSopNode, param: BaseParamType) {
		node.param_callback_reload();
	}
	param_callback_reload() {
		// this._previous_param_url = null

		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.p.url.setDirty();
		// this.setDirty()
	}
}
