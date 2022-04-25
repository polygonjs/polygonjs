/**
 * Loads an svg file from a url.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {FileSVGSopOperation} from '../../operations/sop/FileSVG';
import {Poly} from '../../Poly';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/loader/Geometry';
const DEFAULT = FileSVGSopOperation.DEFAULT_PARAMS;

class FileSVGSopParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {extensions: [GeometryExtension.SVG]},
	});
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			FileSVGSopNode.PARAM_CALLBACK_reload(node as FileSVGSopNode);
		},
	});
	/** @param toggle on to draw the fillShapes */
	drawFillShapes = ParamConfig.BOOLEAN(DEFAULT.drawFillShapes);
	/** @param toggle on to draw the fillShapes as wireframe */
	fillShapesWireframe = ParamConfig.BOOLEAN(DEFAULT.fillShapesWireframe);
	/** @param toggle on to draw the strokes */
	drawStrokes = ParamConfig.BOOLEAN(DEFAULT.drawStrokes);
	/** @param toggle on to draw the strokes as wireframe */
	strokesWireframe = ParamConfig.BOOLEAN(DEFAULT.strokesWireframe);
}
const ParamsConfig = new FileSVGSopParamsConfig();

export class FileSVGSopNode extends TypedSopNode<FileSVGSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopTypeFile.FILE_SVG;
	}

	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}
	// TODO: no error when trying to load a non existing zip file??
	private _operation: FileSVGSopOperation | undefined;
	override async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new FileSVGSopOperation(this.scene(), this.states, this);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	static PARAM_CALLBACK_reload(node: FileSVGSopNode) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.setDirty();
	}
}
