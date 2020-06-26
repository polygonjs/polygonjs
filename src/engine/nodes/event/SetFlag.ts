import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {TypeAssert} from '../../poly/Assert';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';

enum FlagUpdateMode {
	SET = 'set',
	TOGGLE = 'toggle',
}
const FLAG_UPDATE_MODES: FlagUpdateMode[] = [FlagUpdateMode.SET, FlagUpdateMode.TOGGLE];

class SetFlagParamsConfig extends NodeParamsConfig {
	mask = ParamConfig.STRING('/geo*', {});
	sep0 = ParamConfig.SEPARATOR();
	tdisplay = ParamConfig.BOOLEAN(0);
	display_mode = ParamConfig.INTEGER(FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET), {
		visible_if: {tdisplay: 1},
		menu: {
			entries: FLAG_UPDATE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	display = ParamConfig.BOOLEAN(0, {
		visible_if: {tdisplay: 1, display_mode: FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET)},
	});
	sep1 = ParamConfig.SEPARATOR();
	tbypass = ParamConfig.BOOLEAN(0);
	bypass_mode = ParamConfig.INTEGER(FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET), {
		visible_if: {tbypass: 1},
		menu: {
			entries: FLAG_UPDATE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	bypass = ParamConfig.BOOLEAN(0, {
		visible_if: {tbypass: 1, display_mode: FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET)},
	});
	execute = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SetFlagEventNode.PARAM_CALLBACK_execute(node as SetFlagEventNode);
		},
	});
}
const ParamsConfig = new SetFlagParamsConfig();

export class SetFlagEventNode extends TypedEventNode<SetFlagParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'set_flag';
	}
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
		]);
	}
	async process_event(event_context: EventContext<Event>) {
		let mask = this.pv.mask;
		if (event_context.value) {
			const node = event_context.value.node;
			if (node) {
				const parent = node.parent;
				if (parent) {
					mask = `${parent.full_path()}/${mask}`;
				}
			}
		}
		const nodes = this.scene.nodes_controller.nodes_from_mask(mask);

		for (let node of nodes) {
			this._update_node_flags(node);
		}
	}
	private _update_node_flags(node: BaseNodeType) {
		this._update_node_display_flag(node);
		this._update_node_bypass_flag(node);
	}
	private _update_node_display_flag(node: BaseNodeType) {
		if (!this.pv.tdisplay) {
			return;
		}
		if (!node.flags?.has_display()) {
			return;
		}
		const display_flag = node.flags.display;
		if (!display_flag) {
			return;
		}
		const mode = FLAG_UPDATE_MODES[this.pv.display_mode];
		switch (mode) {
			case FlagUpdateMode.SET: {
				display_flag.set(this.pv.display);
				return;
			}
			case FlagUpdateMode.TOGGLE: {
				display_flag.set(!display_flag.active);
				return;
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _update_node_bypass_flag(node: BaseNodeType) {
		if (!this.pv.tbypass) {
			return;
		}
		if (!node.flags?.has_bypass()) {
			return;
		}
		const bypass_flag = node.flags.bypass;
		if (!bypass_flag) {
			return;
		}
		const mode = FLAG_UPDATE_MODES[this.pv.bypass_mode];
		switch (mode) {
			case FlagUpdateMode.SET: {
				bypass_flag.set(this.pv.bypass);
				return;
			}
			case FlagUpdateMode.TOGGLE: {
				bypass_flag.set(!bypass_flag.active);
				return;
			}
		}
		TypeAssert.unreachable(mode);
	}

	static PARAM_CALLBACK_execute(node: SetFlagEventNode) {
		node.process_event({});
	}
}
