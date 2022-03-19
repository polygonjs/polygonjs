/**
 * Creates CSS2DObjects.
 *
 * @remarks
 * This is very useful to create 2D html labels that would be positioned at specific points in the 3D world.
 * Note that the camera must be configured to use a CSS2DRenderer to display them
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {CSS2DObjectSopOperation} from '../../operations/sop/CSS2DObject';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {StringParamLanguage} from '../../params/utils/OptionsController';
const DEFAULT = CSS2DObjectSopOperation.DEFAULT_PARAMS;
class CSS2DObjectSopParamsConfig extends NodeParamsConfig {
	/** @param defines if the vertex id attribute is used to create the html id attribute */
	useIdAttrib = ParamConfig.BOOLEAN(DEFAULT.useIdAttrib);
	/** @param value of the html element id attribute */
	id = ParamConfig.STRING(DEFAULT.id, {
		visibleIf: {useIdAttrib: 0},
	});
	/** @param defines if the vertex class attribute is used to create the html class */
	useClassAttrib = ParamConfig.BOOLEAN(DEFAULT.useClassAttrib);
	/** @param value of the html class */
	className = ParamConfig.STRING(DEFAULT.className, {
		visibleIf: {useClassAttrib: 0},
	});
	/** @param defines if the vertex html attribute is used to create the html content */
	useHTMLAttrib = ParamConfig.BOOLEAN(DEFAULT.useHTMLAttrib);
	/** @param value of the html content */
	html = ParamConfig.STRING(DEFAULT.html, {
		visibleIf: {useHTMLAttrib: 0},
		language: StringParamLanguage.HTML,
	});
	/** @param toggles on if attributes are copied from the geometry to the html element */
	copyAttributes = ParamConfig.BOOLEAN(DEFAULT.copyAttributes);
	/** @param names of the attributes that are copied from the geometry to the html element */
	attributesToCopy = ParamConfig.STRING(DEFAULT.attributesToCopy, {
		visibleIf: {copyAttributes: true},
	});
}
const ParamsConfig = new CSS2DObjectSopParamsConfig();

export class CSS2DObjectSopNode extends TypedSopNode<CSS2DObjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'CSS2DObject';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(CSS2DObjectSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CSS2DObjectSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new CSS2DObjectSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
