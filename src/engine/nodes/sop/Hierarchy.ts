/**
 * Adds or remove parents from the object hierarchy.
 *
 * @remarks
 * This can be useful after importing a geometry from a File SOP, where the part we want to manipulate is under one or several parents. This allows to extract it to make it available for other nodes.
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {HierarchyMode, HierarchySopOperation, HIERARCHY_MODES} from '../../operations/sop/Hierarchy';
const modesWithLevel = [HierarchyMode.ADD_PARENT, HierarchyMode.REMOVE_PARENT];
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = HierarchySopOperation.DEFAULT_PARAMS;
class HierarchySopParamsConfig extends NodeParamsConfig {
	/** @param defines if parent objects will be added or removed */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: HIERARCHY_MODES.map((m, i) => {
				return {name: m, value: i};
			}),
		},
	});
	/** @param defines how many parent objects will be added or removed */
	levels = ParamConfig.INTEGER(DEFAULT.levels, {
		range: [0, 5],
		visibleIf: [
			{mode: HIERARCHY_MODES.indexOf(HierarchyMode.ADD_PARENT)},
			{mode: HIERARCHY_MODES.indexOf(HierarchyMode.REMOVE_PARENT)},
		],
	});
	/** @param when the mode is set to add_child, the mask defines which parent the children are added to. If the mask is an empty string, the children will be added to the objects at the top of the hierarchy. Also, the children are taken from the second input. */
	objectMask = ParamConfig.STRING('', {
		visibleIf: {mode: HIERARCHY_MODES.indexOf(HierarchyMode.ADD_CHILD)},
	});
	/** @param when the mode is set to add_child, the objects used as parent will be printed to the console */
	debugObjectMask = ParamConfig.BOOLEAN(0, {
		visibleIf: {mode: HIERARCHY_MODES.indexOf(HierarchyMode.ADD_CHILD)},
	});
}
const ParamsConfig = new HierarchySopParamsConfig();

export class HierarchySopNode extends TypedSopNode<HierarchySopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'hierarchy';
	}

	static displayedInputNames(): string[] {
		return ['geometry to add or remove parents to/from', 'objects to use as parent or children (optional)'];
	}

	initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(HierarchySopOperation.INPUT_CLONED_STATE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.mode, this.p.levels, this.p.objectMask], () => {
					const mode = HIERARCHY_MODES[this.pv.mode];
					if (modesWithLevel.includes(mode)) {
						return `${mode} ${this.pv.levels}`;
					} else {
						return `${mode} (with mask: ${this.pv.objectMask})`;
					}
				});
			});
		});
	}

	private _operation: HierarchySopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new HierarchySopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
