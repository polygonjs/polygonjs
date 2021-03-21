/**
 * Loads an svg file from a url.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {FileType} from '../../params/utils/OptionsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {ModuleName} from '../../poly/registers/modules/Common';
import {SvgSopOperation} from '../../operations/sop/Svg';
const DEFAULT = SvgSopOperation.DEFAULT_PARAMS;

class SvgSopParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {type: [FileType.SVG]},
	});
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			SvgSopNode.PARAM_CALLBACK_reload(node as SvgSopNode);
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
const ParamsConfig = new SvgSopParamsConfig();

export class SvgSopNode extends TypedSopNode<SvgSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'svg';
	}
	async requiredModules() {
		return [ModuleName.SVGLoader];
	}

	initializeNode() {
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.url], () => {
					const url = this.pv.url;
					if (url) {
						const elements = url.split('/');
						return elements[elements.length - 1];
					} else {
						return '';
					}
				});
			});
		});
	}

	// TODO: no error when trying to load a non existing zip file??
	private _operation: SvgSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SvgSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	static PARAM_CALLBACK_reload(node: SvgSopNode) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.setDirty();
	}
}
