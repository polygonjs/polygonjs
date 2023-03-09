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
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {MathUtils} from 'three';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
import {CadGeometryType, cadGeometryTypeFromShape} from '../../../core/geometry/cad/CadCommon';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {isBooleanTrue} from '../../../core/Type';

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
		const oc = await CadLoader.core(this);
		const newObjects: CadObject<CadGeometryType>[] = [];

		// TODO: refactor to make it work with blob controller
		const reader = new oc.STEPControl_Reader_1();

		const url = this.pv.url;
		const response = await fetch(url);
		const text = await response.text();
		const fileNameShort = MathUtils.generateUUID();
		const FSfileName: string = `file.${fileNameShort}`;
		const canRead = true;
		const canWrite = true;
		const canOwn = true;
		oc.FS.createDataFile('/', FSfileName, text, canRead, canWrite, canOwn);
		const result = reader.ReadFile(FSfileName);
		const isDone = result == oc.IFSelect_ReturnStatus.IFSelect_RetDone;
		if (isDone) {
			reader.TransferRoots(CadLoaderSync.Message_ProgressRange);
			const shape = reader.OneShape();

			const type = cadGeometryTypeFromShape(oc, shape);
			if (type) {
				const newObject = new CadObject(shape, type);

				newObject.traverse((child) => {
					child.matrixAutoUpdate = isBooleanTrue(this.pv.matrixAutoUpdate);
				});

				newObjects.push(newObject);
			}
		}
		this.setCADObjects(newObjects);
	}

	static PARAM_CALLBACK_reload(node: CADFileSTEPSopNode) {
		node._paramCallbackReload();
	}
	private _paramCallbackReload() {
		this.p.url.setDirty();
		this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
	}
}
