/**
 * Rename an attribute
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AttribClassMenuEntries, AttribClass} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../poly/InputCloneMode';
class AttribRenameSopParamsConfig extends NodeParamsConfig {
	/** @param class of the attribute to rename (object or geometry) */
	class = ParamConfig.INTEGER(AttribClass.VERTEX, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param old attribute name */
	oldName = ParamConfig.STRING();
	/** @param new attribute name */
	newName = ParamConfig.STRING();
}
const ParamsConfig = new AttribRenameSopParamsConfig();

export class AttribRenameSopNode extends TypedSopNode<AttribRenameSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribRename';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.oldName, this.p.newName], () => {
					if (this.pv.oldName != '' && this.pv.newName != '') {
						return `${this.pv.oldName} -> ${this.pv.newName}`;
					} else {
						return '';
					}
				});
			});
		});
	}

	cook(input_contents: CoreGroup[]) {
		// const group = input_containers[0].group();
		const core_group = input_contents[0];

		core_group.renameAttrib(this.pv.oldName, this.pv.newName, this.pv.class);

		this.setCoreGroup(core_group);
	}
}
