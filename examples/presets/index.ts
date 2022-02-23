import {NodeContext} from '../../src/engine/poly/NodeContext';

// anim
import {propertyNameAnimPresetRegister} from './anim/PropertyName';
// audio
import {fileAudioPresetRegister} from './audio/File';
import {samplerAudioPresetRegister} from './audio/Sampler';
// cop
import {audioAnalyserCopPresetRegister} from './cop/AudioAnalyser';
import {imageCopPresetRegister} from './cop/Image';
import {videoCopPresetRegister} from './cop/Video';
// // gl
import {attributeGlPresetRegister} from './gl/Attribute';
import {flockingGlPresetRegister} from './gl/Flocking';
import {neighbourAttractGlPresetRegister, neighbourRepulseGlPresetRegister} from './gl/Neighbour';

// // mat
// import {meshSubsurfaceScatteringMatPresetRegister} from './mat/MeshSubsurfaceScattering';
// obj
// sop
import {attribCreateSopPresetRegister} from './sop/AttribCreate';
import {colorSopPresetRegister} from './sop/Color';
import {CSS2DObjectPresetRegister} from './sop/CSS2DObject';
import {dataSopPresetRegister} from './sop/Data';
import {dataUrlSopPresetRegister} from './sop/DataUrl';
import {fileSopPresetRegister, fileGLTFSopPresetRegister} from './sop/File';
import {transformSopPresetRegister} from './sop/Transform';
import {pointSopPresetRegister} from './sop/Point';
import {roundedBoxSopPresetRegister} from './sop/RoundedBox';
import {svgSopPresetRegister} from './sop/Svg';
import {textSopPresetRegister} from './sop/Text';

import {PresetRegister} from './BasePreset';
import {BaseNodeClass, BaseNodeType} from '../../src/engine/nodes/_Base';

class PresetLibraryClass {
	static _instance: PresetLibraryClass | undefined;
	private _presetsByContextAndType: Map<NodeContext, Map<string, PresetRegister<any, any>>> = new Map();
	private constructor() {
		// anim
		this._registerPreset(propertyNameAnimPresetRegister);
		// audio
		this._registerPreset(fileAudioPresetRegister);
		this._registerPreset(samplerAudioPresetRegister);
		// cop
		this._registerPreset(audioAnalyserCopPresetRegister);
		this._registerPreset(imageCopPresetRegister);
		this._registerPreset(videoCopPresetRegister);
		// gl
		this._registerPreset(attributeGlPresetRegister);
		this._registerPreset(flockingGlPresetRegister);
		this._registerPreset(neighbourAttractGlPresetRegister);
		this._registerPreset(neighbourRepulseGlPresetRegister);
		// mat
		// this._registerPreset(meshSubsurfaceScatteringMatPresetRegister);
		// sop
		this._registerPreset(attribCreateSopPresetRegister);
		this._registerPreset(colorSopPresetRegister);
		this._registerPreset(CSS2DObjectPresetRegister);
		this._registerPreset(dataSopPresetRegister);
		this._registerPreset(dataUrlSopPresetRegister);
		this._registerPreset(fileSopPresetRegister);
		this._registerPreset(fileGLTFSopPresetRegister);
		this._registerPreset(pointSopPresetRegister);
		this._registerPreset(roundedBoxSopPresetRegister);
		this._registerPreset(textSopPresetRegister);
		this._registerPreset(svgSopPresetRegister);
		this._registerPreset(transformSopPresetRegister);
	}

	private _registerPreset<N extends typeof BaseNodeClass, NI extends BaseNodeClass>(register: PresetRegister<N, NI>) {
		const context = register.nodeClass.context();
		const type = register.nodeClass.type();
		let typeMap = this._presetsByContextAndType.get(context);
		if (!typeMap) {
			typeMap = new Map<string, PresetRegister<any, any>>();
			this._presetsByContextAndType.set(context, typeMap);
		}
		typeMap.set(type, register);
	}
	preset(node: BaseNodeType) {
		return this._presetsByContextAndType.get(node.context())?.get(node.type());
	}

	static instance() {
		return (this._instance = this._instance || new PresetLibraryClass());
	}
}
export const PresetLibrary = PresetLibraryClass.instance();
