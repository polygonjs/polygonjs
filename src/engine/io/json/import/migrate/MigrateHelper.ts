import {ImageExtension} from '../../../../../core/FileTypeController';
import {GeometryExtension} from '../../../../../core/loader/Geometry';
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
};

function migrateCop(nodeData: NodeJsonExporterData) {
	const nodeType = nodeData.type;
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
}
