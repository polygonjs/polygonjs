/**
 * Loads a IFC from a url.
 *
 *
 */
import {ParamEvent} from './../../poly/ParamEvent';
import {TypedSopNode} from './_Base';
import {BaseNodeType} from '../_Base';
import {FileIFCSopOperation} from '../../operations/sop/FileIFC';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Poly} from '../../Poly';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
const DEFAULT = FileIFCSopOperation.DEFAULT_PARAMS;
class FileIFCParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_IFC]},
	});

	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(0);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileIFCSopNode.PARAM_CALLBACK_reload(node as FileIFCSopNode);
		},
	});
}
const ParamsConfig = new FileIFCParamsConfig();

export class FileIFCSopNode extends TypedSopNode<FileIFCParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopTypeFile.FILE_IFC;
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private _operation: FileIFCSopOperation | undefined;
	private operation() {
		return (this._operation = this._operation || new FileIFCSopOperation(this.scene(), this.states, this));
	}
	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = await this.operation().cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	static PARAM_CALLBACK_reload(node: FileIFCSopNode) {
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
