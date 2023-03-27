/**
 * Loads a .STEP file
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseNodeType} from '../_Base';
import {ParamEvent} from '../../poly/ParamEvent';
import {Poly} from '../../Poly';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
import {STEPLoaderHandler} from '../../../core/loader/geometry/STEP';

class CADFileSTEPSopParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING('', {
		fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopType.CAD_FILE_STEP]},
	});
	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(0);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			CADFileSTEPSopNode.PARAM_CALLBACK_reload(node as CADFileSTEPSopNode);
		},
	});
}
const ParamsConfig = new CADFileSTEPSopParamsConfig();

export class CADFileSTEPSopNode extends CADSopNode<CADFileSTEPSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_FILE_STEP;
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		Poly.blobs.clearBlobsForNode(this);
		const loader = this._createGeoLoaderHandler(this.pv.url);
		const result = await loader.load({node: this});
		if (result) {
			const matrixAutoUpdate: boolean = this.pv.matrixAutoUpdate;
			for (let object of result) {
				object.traverse((child) => {
					child.matrixAutoUpdate = matrixAutoUpdate;
				});
			}
			return this.setCADObjects(result);
		}
		return this.setCADObjects([]);
	}
	protected _createGeoLoaderHandler(url: string) {
		return new STEPLoaderHandler(url, this);
	}

	static PARAM_CALLBACK_reload(node: CADFileSTEPSopNode) {
		node._paramCallbackReload();
	}
	private _paramCallbackReload() {
		this.p.url.setDirty();
		this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
	}
}
