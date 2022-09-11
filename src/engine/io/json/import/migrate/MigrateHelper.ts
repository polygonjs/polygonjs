import {CoreType} from './../../../../../core/Type';
import {ParamType} from './../../../../poly/ParamType';
import {SimpleParamJsonExporterData} from './../../../../nodes/utils/io/IOController';
import {SceneJsonImporter} from '../Scene';
import {ImageExtension} from '../../../../../core/FileTypeController';
import {GeometryExtension} from '../../../../../core/FileTypeController';
import {CoreBaseLoader} from '../../../../../core/loader/_Base';
import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../../nodes/_Base';
import {NodeContext} from '../../../../poly/NodeContext';
import {CopTypeImage} from '../../../../poly/registers/nodes/types/Cop';
import {SopTypeFile, SopTypeFileMulti} from '../../../../poly/registers/nodes/types/Sop';
import {NodeJsonExporterData} from '../../export/Node';

const ACTOR_NEW_TYPES: PolyDictionary<string> = {
	onEventChildAttributeUpdated: 'OnChildAttributeUpdate',
	onEventManualTrigger: 'OnManualTrigger',
	onEventObjectAttributeUpdated: 'OnObjectAttributeUpdate',
	onEventObjectClicked: 'OnObjectClick',
	onEventObjectHovered: 'OnObjectHover',
	onEventTick: 'OnTick',
	OnObjectPointerDown: 'OnObjectPointerdown',
	OnObjectPointerUp: 'OnObjectPointerup',
	OnPointerDown: 'OnPointerdown',
	OnPointerUp: 'OnPointerup',
};

function migrateCop(nodeData: NodeJsonExporterData) {
	const nodeType = nodeData.type;
	if (nodeType == 'imageSequence') {
		return 'video';
	}
	if (nodeType == 'image') {
		const url = nodeData.params?.url as string;
		if (url) {
			const ext = CoreBaseLoader.extension(url) as ImageExtension;

			function imageTypeByExt(ext: ImageExtension) {
				switch (ext) {
					case ImageExtension.EXR: {
						return CopTypeImage.IMAGE_EXR;
					}
					case ImageExtension.HDR: {
						return CopTypeImage.IMAGE_HDR;
					}
					case ImageExtension.KTX2: {
						return CopTypeImage.IMAGE_KTX2;
					}
				}
				// TypeAssert.unreachable(ext);
			}

			return imageTypeByExt(ext);
		}
	}
}

const GL_NEW_TYPES: PolyDictionary<string> = {
	substract: 'subtract',
	SDFSubtraction: 'SDFSubtract',
	SDFIntersection: 'SDFIntersect',
};

function migrateSop(nodeData: NodeJsonExporterData) {
	const nodeType = nodeData.type;
	switch (nodeType) {
		case 'file': {
			const url = nodeData.params?.url as string;
			if (url) {
				const ext = CoreBaseLoader.extension(url) as GeometryExtension;

				function imageTypeByExt(ext: GeometryExtension) {
					switch (ext) {
						case GeometryExtension.DRC: {
							return SopTypeFile.FILE_DRC;
						}
						case GeometryExtension.FBX: {
							return SopTypeFile.FILE_FBX;
						}
						case GeometryExtension.GLB:
						case GeometryExtension.GLTF: {
							return SopTypeFile.FILE_GLTF;
						}
						case GeometryExtension.JSON: {
							return SopTypeFile.FILE_JSON;
						}
						case GeometryExtension.MPD: {
							return SopTypeFile.FILE_MPD;
						}
						case GeometryExtension.OBJ: {
							return SopTypeFile.FILE_OBJ;
						}
						case GeometryExtension.PDB: {
							return SopTypeFile.FILE_PDB;
						}
						case GeometryExtension.PLY: {
							return SopTypeFile.FILE_PLY;
						}
						case GeometryExtension.STL: {
							return SopTypeFile.FILE_STL;
						}
					}
					// TypeAssert.unreachable(ext);
				}

				return imageTypeByExt(ext);
			}
		}
		case 'fileMulti': {
			return SopTypeFileMulti.FILE_OBJ;
		}
		case 'svg': {
			return SopTypeFile.FILE_SVG;
		}
		case 'playerCapsule': {
			return 'capsule';
		}
	}
}
const POST_NEW_TYPES: PolyDictionary<string> = {
	RGBShift: 'chromaticAberration',
	image: 'texture',
	film: 'noise',
	FXAA: 'antialiasing',
	horizontalBlur: 'blur',
	triangleBlur: 'blur',
	unrealBloom: 'bloom',
	verticalBlur: 'blur',
};
import {BlendFunction} from 'postprocessing';
function migratePostNodeBlendFunction(nodeData: NodeJsonExporterData) {
	const paramsData = nodeData['params'];
	if (!paramsData) {
		return;
	}
	const blendFunction = paramsData['blendFunction'] as SimpleParamJsonExporterData<ParamType.INTEGER> | undefined;
	if (!blendFunction) {
		return;
	}
	if (!CoreType.isNumber(blendFunction)) {
		return;
	}

	const BLEND_FUNCTIONS_LEGACY: BlendFunction[] = [
		BlendFunction.SKIP,
		BlendFunction.ADD,
		BlendFunction.ALPHA,
		BlendFunction.AVERAGE,
		BlendFunction.COLOR_BURN,
		BlendFunction.COLOR_DODGE,
		BlendFunction.DARKEN,
		BlendFunction.DIFFERENCE,
		BlendFunction.EXCLUSION,
		BlendFunction.LIGHTEN,
		BlendFunction.MULTIPLY,
		BlendFunction.DIVIDE,
		BlendFunction.NEGATION,
		BlendFunction.NORMAL,
		BlendFunction.OVERLAY,
		BlendFunction.REFLECT,
		BlendFunction.SCREEN,
		BlendFunction.SET,
		BlendFunction.SOFT_LIGHT,
		BlendFunction.SUBTRACT,
	];
	const newBlendFunction = BLEND_FUNCTIONS_LEGACY[blendFunction];
	if (newBlendFunction == null) {
		return;
	}
	paramsData['blendFunction'] = newBlendFunction;
}
export class JsonImporterMigrateHelper {
	static migrateNodeType(parentNode: BaseNodeType, nodeData: NodeJsonExporterData) {
		const nodeType = nodeData.type;
		switch (parentNode.childrenControllerContext()) {
			case NodeContext.ACTOR: {
				return ACTOR_NEW_TYPES[nodeType] || nodeType;
			}
			case NodeContext.COP: {
				return migrateCop(nodeData) || nodeType;
			}
			case NodeContext.GL: {
				return GL_NEW_TYPES[nodeType] || nodeType;
			}
			case NodeContext.SOP: {
				return migrateSop(nodeData) || nodeType;
			}
			case NodeContext.POST: {
				return POST_NEW_TYPES[nodeType] || nodeType;
			}
		}
		return nodeType;
	}
	static migrateParams(sceneImporter: SceneJsonImporter, parentNode: BaseNodeType, nodeData: NodeJsonExporterData) {
		switch (parentNode.childrenControllerContext()) {
			case NodeContext.POST: {
				if (sceneImporter.isPolygonjsVersionLessThan('1.2.11')) {
					migratePostNodeBlendFunction(nodeData);
				}
			}
		}
	}
}
