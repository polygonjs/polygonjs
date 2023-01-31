/**
 * Loads a GLTF from a url.
 *
 *
 */
import {ParamEvent} from './../../poly/ParamEvent';
import {TypedSopNode} from './_Base';
import {BaseNodeType} from '../_Base';
import {FileGLTFSopOperation} from '../../operations/sop/FileGLTF';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Poly} from '../../Poly';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
const DEFAULT = FileGLTFSopOperation.DEFAULT_PARAMS;
class FileGLTFParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_GLTF]},
	});
	/** @param uses draco compression */
	draco = ParamConfig.BOOLEAN(DEFAULT.draco);
	/** @param uses ktx2 compression */
	ktx2 = ParamConfig.BOOLEAN(DEFAULT.ktx2);
	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(0);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileGLTFSopNode.PARAM_CALLBACK_reload(node as FileGLTFSopNode);
		},
	});
}
const ParamsConfig = new FileGLTFParamsConfig();

export class FileGLTFSopNode extends TypedSopNode<FileGLTFParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopTypeFile.FILE_GLTF;
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private _operation: FileGLTFSopOperation | undefined;
	private operation() {
		return (this._operation = this._operation || new FileGLTFSopOperation(this.scene(), this.states, this));
	}
	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = await this.operation().cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	static PARAM_CALLBACK_reload(node: FileGLTFSopNode) {
		node._paramCallbackReload();
	}
	private _paramCallbackReload() {
		// this.operation().clearLoadedBlob(this.pv);
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.setDirty();
		this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
		// this.setDirty()
	}
}
