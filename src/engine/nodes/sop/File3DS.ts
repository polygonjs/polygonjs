/**
 * Loads a 3DS from a url.
 *
 *
 */
import {File3DSSopOperation} from '../../operations/sop/File3DS';
// import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
// import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {TypedSopNode} from './_Base';
import {ParamEvent} from '../../poly/ParamEvent';
import {CoreGroup} from '../../../core/geometry/Group';
// export class File3DSSopNode extends fileSopNodeFactory({
// 	type: SopTypeFile.FILE_3DS,
// 	operation: File3DSSopOperation as typeof BaseFileSopOperation,
// 	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_3DS],
// }) {}
const DEFAULT = File3DSSopOperation.DEFAULT_PARAMS;

class File3DSParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_3DS]},
	});
	/** @param texture folder url */
	resourceUrl = ParamConfig.STRING(DEFAULT.resourceUrl);
	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			File3DSSopNode.PARAM_CALLBACK_reload(node as File3DSSopNode);
		},
	});
}
const ParamsConfig = new File3DSParamsConfig();

export class File3DSSopNode extends TypedSopNode<File3DSParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopTypeFile.FILE_3DS;
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private _operation: File3DSSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new File3DSSopOperation(this.scene(), this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	static PARAM_CALLBACK_reload(node: File3DSSopNode) {
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
