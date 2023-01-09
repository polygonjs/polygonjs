import {NodeContext} from '../../src/engine/poly/NodeContext';

// actor
import {getObjectAttributeActorPresetRegister} from './actor/GetObjectAttribute';
import {getChildrenAttributesActorPresetRegister} from './actor/GetChildrenAttributes';
import {onChildAttributeUpdateActorPresetRegister} from './actor/OnEventChildAttributeUpdated';
import {onObjectAttributeUpdateActorPresetRegister} from './actor/OnEventObjectAttributeUpdated';
import {rayFromCameraActorPresetRegister} from './actor/RayFromCamera';
// anim
import {propertyNameAnimPresetRegister} from './anim/PropertyName';
// audio
import {fileAudioPresetRegister} from './audio/File';
import {samplerAudioPresetRegister} from './audio/Sampler';
// cop
import {audioAnalyserCopPresetRegister} from './cop/AudioAnalyser';
import {cubeMapCopPresetRegister} from './cop/CubeMap';
import {imageCopPresetRegister} from './cop/Image';
import {imageEXRCopPresetRegister} from './cop/ImageEXR';
import {lutCopPresetRegister} from './cop/Lut';
import {SDFFromUrlCopPresetRegister} from './cop/SDFFromUrl';
import {videoCopPresetRegister} from './cop/Video';
// // gl
import {attributeGlPresetRegister} from './gl/Attribute';
import {neighbourAttractRepulseGlPresetRegister} from './gl/NeighbourAttractRepulse';
import {neighbourAttractGlPresetRegister, neighbourRepulseGlPresetRegister} from './gl/Neighbour';

// // mat
// import {meshSubsurfaceScatteringMatPresetRegister} from './mat/MeshSubsurfaceScattering';
import {codeMatPresetRegister} from './mat/Code';
// obj
// sop
import {attribCreateSopPresetRegister} from './sop/AttribCreate';
import {attribPromoteSopPresetRegister} from './sop/AttribPromote';
import {capsuleSopPresetRegister} from './sop/Capsule';
import {codeSopPresetRegister} from './sop/Code';
import {colorSopPresetRegister} from './sop/Color';
import {CSS2DObjectPresetRegister} from './sop/CSS2DObject';
import {dataSopPresetRegister} from './sop/Data';
import {dataUrlSopPresetRegister} from './sop/DataUrl';
import {
	fileDRCSopPresetRegister,
	fileFBXSopPresetRegister,
	fileGLTFSopPresetRegister,
	fileJSONSopPresetRegister,
	fileMPDSopPresetRegister,
	fileOBJSopPresetRegister,
	filePDBSopPresetRegister,
	filePLYSopPresetRegister,
	fileSTLSopPresetRegister,
} from './sop/File';
import {normalsSopPresetRegister} from './sop/Normals';
import {pointSopPresetRegister} from './sop/Point';
import {roundedBoxSopPresetRegister} from './sop/RoundedBox';
import {scatterSopPresetRegister} from './sop/Scatter';
import {transformSopPresetRegister} from './sop/Transform';
import {fileSVGSopPresetRegister} from './sop/FileSVG';
import {textSopPresetRegister} from './sop/Text';

import {PresetRegister} from './BasePreset';
import {BaseNodeClass, BaseNodeType} from '../../src/engine/nodes/_Base';

class PresetLibraryClass {
	static _instance: PresetLibraryClass | undefined;
	private _presetsByContextAndType: Map<NodeContext, Map<string, PresetRegister<any, any>>> = new Map();
	private constructor() {
		// actor
		this._registerPreset(getObjectAttributeActorPresetRegister);
		this._registerPreset(getChildrenAttributesActorPresetRegister);
		this._registerPreset(onChildAttributeUpdateActorPresetRegister);
		this._registerPreset(onObjectAttributeUpdateActorPresetRegister);
		this._registerPreset(rayFromCameraActorPresetRegister);
		// anim
		this._registerPreset(propertyNameAnimPresetRegister);
		// audio
		this._registerPreset(fileAudioPresetRegister);
		this._registerPreset(samplerAudioPresetRegister);
		// cop
		this._registerPreset(audioAnalyserCopPresetRegister);
		this._registerPreset(cubeMapCopPresetRegister);
		this._registerPreset(imageCopPresetRegister);
		this._registerPreset(imageEXRCopPresetRegister);
		this._registerPreset(lutCopPresetRegister);
		this._registerPreset(SDFFromUrlCopPresetRegister);
		this._registerPreset(videoCopPresetRegister);
		// gl
		this._registerPreset(attributeGlPresetRegister);
		this._registerPreset(neighbourAttractRepulseGlPresetRegister);
		this._registerPreset(neighbourAttractGlPresetRegister);
		this._registerPreset(neighbourRepulseGlPresetRegister);
		// mat
		// this._registerPreset(meshSubsurfaceScatteringMatPresetRegister);
		this._registerPreset(codeMatPresetRegister);
		// sop
		this._registerPreset(attribCreateSopPresetRegister);
		this._registerPreset(attribPromoteSopPresetRegister);
		this._registerPreset(capsuleSopPresetRegister);
		this._registerPreset(codeSopPresetRegister);
		this._registerPreset(colorSopPresetRegister);
		this._registerPreset(CSS2DObjectPresetRegister);
		this._registerPreset(dataSopPresetRegister);
		this._registerPreset(dataUrlSopPresetRegister);
		this._registerPreset(fileDRCSopPresetRegister);
		this._registerPreset(fileFBXSopPresetRegister);
		this._registerPreset(fileGLTFSopPresetRegister);
		this._registerPreset(fileJSONSopPresetRegister);
		this._registerPreset(fileMPDSopPresetRegister);
		this._registerPreset(fileOBJSopPresetRegister);
		this._registerPreset(filePDBSopPresetRegister);
		this._registerPreset(filePLYSopPresetRegister);
		this._registerPreset(fileSTLSopPresetRegister);
		this._registerPreset(fileSVGSopPresetRegister);
		this._registerPreset(normalsSopPresetRegister);
		this._registerPreset(pointSopPresetRegister);
		this._registerPreset(roundedBoxSopPresetRegister);
		this._registerPreset(scatterSopPresetRegister);
		this._registerPreset(textSopPresetRegister);
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
