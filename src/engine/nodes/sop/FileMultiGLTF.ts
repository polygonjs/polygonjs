/**
 * Loads multiple geometries from a url, using attributes from the input points. This can be more convenient than the File SOP if you want to load many geometries.
 *
 * @remarks
 * Note that this node will automatically use a specific loader depending on the extension of the url.
 *
 */
import {GeometryExtension} from '../../../core/FileTypeController';
import {BaseNodeType} from '../_Base';
import {BaseFileMultiSopNode} from './utils/file/_BaseSopFileMulti';
import {SopTypeFileMulti} from '../../poly/registers/nodes/types/Sop';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {GLTFLoaderHandler} from '../../../core/loader/geometry/GLTF';
import {FileGLTFSopOperation} from '../../operations/sop/FileGLTF';
import {GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
const DEFAULT = FileGLTFSopOperation.DEFAULT_PARAMS;

class FileMultiGLTFParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(`${ASSETS_ROOT}/models/\`@name\`.glb`, {
		fileBrowse: {extensions: [GeometryExtension.GLTF, GeometryExtension.GLB]},
		expression: {forEntities: true},
	});
	/** @param uses draco compression */
	draco = ParamConfig.BOOLEAN(DEFAULT.draco);
	/** @param uses ktx2 compression */
	ktx2 = ParamConfig.BOOLEAN(DEFAULT.ktx2);
	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(false);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			BaseFileMultiSopNode.PARAM_CALLBACK_reload(node as FileMultiGLTFSopNode);
		},
	});
}

const ParamsConfig = new FileMultiGLTFParamsConfig();
export class FileMultiGLTFSopNode extends BaseFileMultiSopNode<GLTF, FileMultiGLTFParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopTypeFileMulti.FILE_GLTF;
	}
	protected _createLoader(url: string) {
		return new GLTFLoaderHandler(url, this);
	}
	protected override _loadWithLoader(loader: GLTFLoaderHandler) {
		return loader.load({
			draco: this.pv.draco,
			ktx2: this.pv.ktx2,
			node: this,
		});
	}
}
