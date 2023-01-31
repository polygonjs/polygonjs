/**
 * Create points from a an array of json dictionaries
 *
 * @remarks
 * This node is similar to the [Data SOP], but will fetch the data from a url.
 *
 */
import {TypedSopNode} from './_Base';
import {JsonDataLoader} from '../../../core/loader/geometry/JSONDataLoader';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {CsvLoader} from '../../../core/loader/geometry/Csv';
import {BufferGeometry} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Poly} from '../../Poly';
import {ParamEvent} from '../../poly/ParamEvent';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
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
	url = ParamConfig.STRING(DEFAULT_URL, {
		fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopType.DATA_URL]},
	});

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
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.DATA_URL;
	}

	override async cook() {
		this._load();
	}
	private _load() {
		switch (DATA_TYPES[this.pv.dataType]) {
			case DataType.JSON:
				return this._loadJSON();
			case DataType.CSV:
				return this._loadCSV();
		}
	}
	// private _clearLoadedBlob() {
	// 	switch (DATA_TYPES[this.pv.dataType]) {
	// 		case DataType.JSON:
	// 			return this._resetJSON();
	// 		case DataType.CSV:
	// 			return this._resetCSV();
	// 	}
	// }
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}
	private _url() {
		// do not use assetsRoot here, as it would use it twice
		// as it is already used in the loader.
		// const assets_root = this.scene().assets.root();
		// if (assets_root) {
		// 	return `${assets_root}${this.pv.url}`;
		// } else {
		return this.pv.url;
		// }
	}
	//
	//
	// JSON
	//
	//
	private _loadJSON() {
		const loader = new JsonDataLoader(
			this._url(),
			{
				dataKeysPrefix: this.pv.jsonDataKeysPrefix,
				skipEntries: this.pv.skipEntries,
				doConvert: isBooleanTrue(this.pv.convert),
				convertToNumeric: this.pv.convertToNumeric,
			},
			this
		);

		loader.load(this._onLoad.bind(this), undefined, this._onError.bind(this));
	}
	// private _resetJSON() {
	// 	const loader = new JsonDataLoader(this._url(), this.scene());
	// 	loader.deregisterUrl();
	// }

	private _onLoad(geometry: BufferGeometry) {
		this.setGeometry(geometry, ObjectType.POINTS);
	}
	private _onError(error: ErrorEvent) {
		this.states.error.set(`could not load geometry from ${this._url()} (${error})`);
		this.cookController.endCook();
	}

	//
	//
	// CSV
	//
	//
	private async _loadCSV() {
		const attribNames = isBooleanTrue(this.pv.readAttribNamesFromFile) ? undefined : this.pv.attribNames.split(' ');
		const loader = new CsvLoader(this._url(), attribNames, this);
		const geometry = await loader.load();
		if (geometry) {
			this.setGeometry(geometry, ObjectType.POINTS);
		} else {
			this.states.error.set('could not generate points');
		}
	}
	// private _resetCSV() {
	// 	const attribNames: string[] = [];
	// 	const loader = new CsvLoader(this._url(), this.scene(), attribNames, this);
	// 	loader.deregisterUrl();
	// }

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
		// this._clearLoadedBlob();
		// this._previous_param_url = null

		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.p.url.setDirty();
		this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
		// this.setDirty()
	}
}
