import {BaseNodeType} from '../../src/engine/nodes/_Base';
import {ParamConstructorMap} from '../../src/engine/params/types/ParamConstructorMap';
import {ParamInitValuesTypeMap} from '../../src/engine/params/types/ParamInitValuesTypeMap';
import {ParamType} from '../../src/engine/poly/ParamType';
import {PolyDictionary} from '../../src/types/GlobalTypes';

export interface PresetEntry<T extends ParamType> {
	param: ParamConstructorMap[T];
	value: ParamInitValuesTypeMap[T];
}

export class BasePreset {
	private _entries: PresetEntry<ParamType>[] = [];
	addEntry<T extends ParamType>(param: ParamConstructorMap[T], value: ParamInitValuesTypeMap[T]) {
		this._entries.push({param, value});
		return this;
	}

	entries() {
		return this._entries;
	}
}

export class NodePresetsCollection {
	private _presetsByName: Map<string, BasePreset> = new Map();

	// constructor(dic: PolyDictionary<PresetEntry<ParamType>[]>){
	// 	const presetNames:string[] = Object.keys(dic)
	// 	for(let presetName of presetNames){
	// 		const entries = dic[presetName]
	// 		this._addPreset(presetName, entries)
	// 	}
	// }
	setPresets(presetsByName: PolyDictionary<BasePreset>) {
		const names = Object.keys(presetsByName);
		for (let name of names) {
			const preset = presetsByName[name];
			this.addPreset(name, preset);
		}
		this._updatePresetNames();
		return this;
	}
	addPreset(presetName: string, preset: BasePreset) {
		if (this._presetsByName.get(presetName)) {
			console.warn('existing preset', preset);
		}

		this._presetsByName.set(presetName, preset);
		return this;
	}
	private _presetNames: string[] = [];
	private _updatePresetNames() {
		this._presetNames.length = 0;
		this._presetsByName.forEach((preset, presetName) => {
			this._presetNames.push(presetName);
		});
		this._presetNames.sort();
	}
	presetNames() {
		return this._presetNames;
	}
	getPreset(presetName: string) {
		return this._presetsByName.get(presetName);
	}
	// addPreset(presetName:string, entries: PresetEntry<ParamType>[]){
	// 	if(this._presetsByName.get(presetName)){
	// 		console.warn('existing preset')
	// 	}

	// 	const preset = new BasePreset()
	// 	for(let entry of entries){
	// 		preset.addEntry(entry)
	// 	}
	// 	this._presetsByName.set(presetName, preset)
	// }
}

export type PresetsCollectionFactory<N extends BaseNodeType> = (node: N) => NodePresetsCollection;

import {BaseNodeClass} from '../../src/engine/nodes/_Base';
// import {BaseParamType} from '../../src/engine/params/_Base';

// type PresetCallback<N extends BaseNodeType> = () => NodePresetsCollection
// interface ParamsLabelConfig {
// 	params: BaseParamType | BaseParamType[];
// 	callback: ParamsLabelCallback;
// }
// export type ParamsLabelSetup<N extends BaseNodeClass> = (node: N) => ParamsLabelConfig;

// export type ParamsLabelRegister<N extends typeof BaseNodeClass, NI extends BaseNodeClass> = (
// 	node: N
// ) => ParamsLabelSetup<NI>;

export interface PresetRegister<N extends typeof BaseNodeClass, NI extends BaseNodeClass> {
	nodeClass: N;
	setupFunc: PresetsCollectionFactory<NI>;
}
