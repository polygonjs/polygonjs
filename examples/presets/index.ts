import {NodeContext} from '../../src/engine/poly/NodeContext';

// anim
import {propertyNameAnimPresetRegister} from './anim/PropertyName';
// audio
import {fileAudioPresetRegister} from './audio/File';
import {samplerAudioPresetRegister} from './audio/Sampler';
// cop
import {audioAnalyserCopPresetRegister} from './cop/AudioAnalyser';
import {cubeMapCopPresetRegister} from './cop/CubeMap';
import {geometryAttributeCopPresetRegister} from './cop/GeometryAttribute';
import {imageCopPresetRegister} from './cop/Image';
import {imageEXRCopPresetRegister} from './cop/ImageEXR';
import {lutCopPresetRegister} from './cop/Lut';
import {mapboxElevationCopPresetRegister} from './cop/MapboxElevation';
import {mapboxSatelliteCopPresetRegister} from './cop/MapboxSatellite';
import {SDFFromUrlCopPresetRegister} from './cop/SDFFromUrl';
import {videoCopPresetRegister} from './cop/Video';
// gl
import {attributeGlPresetRegister} from './gl/Attribute';
import {neighbourAttractRepulseGlPresetRegister} from './gl/NeighbourAttractRepulse';
import {neighbourAttractGlPresetRegister, neighbourRepulseGlPresetRegister} from './gl/Neighbour';
// js
import {attributeJsPresetRegister} from './js/Attribute';
import {getChildrenAttributesJsPresetRegister} from './js/GetChildrenAttributes';
import {getObjectAttributeJsPresetRegister} from './js/GetObjectAttribute';
import {getObjectUserDataJsPresetRegister} from './js/GetObjectUserData';
import {onChildAttributeUpdateJsPresetRegister} from './js/OnChildAttributeUpdate';
import {onKeyJsPresetRegister} from './js/OnKey';
import {onObjectAttributeUpdateJsPresetRegister} from './js/OnObjectAttributeUpdate';
import {rayFromCameraJsPresetRegister} from './js/RayFromCamera';

// // mat
// import {meshSubsurfaceScatteringMatPresetRegister} from './mat/MeshSubsurfaceScattering';
import {codeMatPresetRegister} from './mat/Code';
// obj
// sop
import {attribCreateSopPresetRegister} from './sop/AttribCreate';
import {attribPromoteSopPresetRegister} from './sop/AttribPromote';
import {cadFileSTEPSopPresetRegister} from './sop/CADFileSTEP';
import {cameraWebXRARMarkerTrackingSopPresetRegister} from './sop/CameraWebXRARMarkerTracking';
import {capsuleSopPresetRegister} from './sop/Capsule';
import {codeSopPresetRegister} from './sop/Code';
import {colorSopPresetRegister} from './sop/Color';
import {CSS2DObjectPresetRegister} from './sop/CSS2DObject';
import {dataSopPresetRegister} from './sop/Data';
import {dataUrlSopPresetRegister} from './sop/DataUrl';
import {deleteSopPresetRegister} from './sop/Delete';
import {directionalLightSopPresetRegister} from './sop/DirectionalLight';
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
import {fileSVGSopPresetRegister} from './sop/FileSVG';
import {fileGEOJSONSopPresetRegister} from './sop/FileGEOJSON';
import {mapboxCameraSopPresetRegister} from './sop/MapboxCamera';
import {normalsSopPresetRegister} from './sop/Normals';
import {pointSopPresetRegister} from './sop/Point';
import {roundedBoxSopPresetRegister} from './sop/RoundedBox';
import {scatterSopPresetRegister} from './sop/Scatter';
import {spotLightSopPresetRegister} from './sop/SpotLight';
import {transformSopPresetRegister} from './sop/Transform';
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
		this._registerPreset(cubeMapCopPresetRegister);
		this._registerPreset(geometryAttributeCopPresetRegister);
		this._registerPreset(imageCopPresetRegister);
		this._registerPreset(imageEXRCopPresetRegister);
		this._registerPreset(lutCopPresetRegister);
		this._registerPreset(mapboxElevationCopPresetRegister);
		this._registerPreset(mapboxSatelliteCopPresetRegister);
		this._registerPreset(SDFFromUrlCopPresetRegister);
		this._registerPreset(videoCopPresetRegister);
		// gl
		this._registerPreset(attributeGlPresetRegister);
		this._registerPreset(neighbourAttractRepulseGlPresetRegister);
		this._registerPreset(neighbourAttractGlPresetRegister);
		this._registerPreset(neighbourRepulseGlPresetRegister);
		// js
		this._registerPreset(attributeJsPresetRegister);
		this._registerPreset(getChildrenAttributesJsPresetRegister);
		this._registerPreset(getObjectAttributeJsPresetRegister);
		this._registerPreset(getObjectUserDataJsPresetRegister);
		this._registerPreset(onChildAttributeUpdateJsPresetRegister);
		this._registerPreset(onKeyJsPresetRegister);
		this._registerPreset(onObjectAttributeUpdateJsPresetRegister);
		this._registerPreset(rayFromCameraJsPresetRegister);
		// mat
		// this._registerPreset(meshSubsurfaceScatteringMatPresetRegister);
		this._registerPreset(codeMatPresetRegister);
		// sop
		this._registerPreset(attribCreateSopPresetRegister);
		this._registerPreset(attribPromoteSopPresetRegister);
		this._registerPreset(cadFileSTEPSopPresetRegister);
		this._registerPreset(cameraWebXRARMarkerTrackingSopPresetRegister);
		this._registerPreset(capsuleSopPresetRegister);
		this._registerPreset(codeSopPresetRegister);
		this._registerPreset(colorSopPresetRegister);
		this._registerPreset(CSS2DObjectPresetRegister);
		this._registerPreset(dataSopPresetRegister);
		this._registerPreset(dataUrlSopPresetRegister);
		this._registerPreset(deleteSopPresetRegister);
		this._registerPreset(directionalLightSopPresetRegister);
		this._registerPreset(fileDRCSopPresetRegister);
		this._registerPreset(fileFBXSopPresetRegister);
		this._registerPreset(fileGEOJSONSopPresetRegister);
		this._registerPreset(fileGLTFSopPresetRegister);
		this._registerPreset(fileJSONSopPresetRegister);
		this._registerPreset(fileMPDSopPresetRegister);
		this._registerPreset(fileOBJSopPresetRegister);
		this._registerPreset(filePDBSopPresetRegister);
		this._registerPreset(filePLYSopPresetRegister);
		this._registerPreset(fileSTLSopPresetRegister);
		this._registerPreset(fileSVGSopPresetRegister);
		this._registerPreset(mapboxCameraSopPresetRegister);
		this._registerPreset(normalsSopPresetRegister);
		this._registerPreset(pointSopPresetRegister);
		this._registerPreset(roundedBoxSopPresetRegister);
		this._registerPreset(scatterSopPresetRegister);
		this._registerPreset(spotLightSopPresetRegister);
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
