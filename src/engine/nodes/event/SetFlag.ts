/**
 * Updates the flags of specific nodes
 *
 * @remarks
 * This can be useful to show/hide objects, or to cook specific networks
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {TypeAssert} from '../../poly/Assert';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/BooleanValue';
import { EventContext } from '../../../core/event/EventContextType';

enum FlagUpdateMode {
	SET = 'set',
	TOGGLE = 'toggle',
}
const FLAG_UPDATE_MODES: FlagUpdateMode[] = [FlagUpdateMode.SET, FlagUpdateMode.TOGGLE];

class SetFlagParamsConfig extends NodeParamsConfig {
	/** @param mask to select which nodes this can change the flags of */
	mask = ParamConfig.STRING('/geo*', {separatorAfter: true});
	/** @param toggle on to update the display flag */
	tdisplay = ParamConfig.BOOLEAN(0);
	/** @param sets how the display flag will be updated (set to a value or toggle) */
	displayMode = ParamConfig.INTEGER(FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET), {
		visibleIf: {tdisplay: 1},
		menu: {
			entries: FLAG_UPDATE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param new display flag state */
	display = ParamConfig.BOOLEAN(0, {
		visibleIf: {tdisplay: 1, displayMode: FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET)},
		separatorAfter: true,
	});
	/** @param toggle on to update the bypass flag */
	tbypass = ParamConfig.BOOLEAN(0);
	/** @param sets how the bypass flag will be updated (set to a value or toggle) */
	bypassMode = ParamConfig.INTEGER(FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET), {
		visibleIf: {tbypass: 1},
		menu: {
			entries: FLAG_UPDATE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param new bypass flag state */
	bypass = ParamConfig.BOOLEAN(0, {
		visibleIf: {tbypass: 1, displayMode: FLAG_UPDATE_MODES.indexOf(FlagUpdateMode.SET)},
	});
	/** @param button to trigger the node. Useful to debug */
	execute = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SetFlagEventNode.PARAM_CALLBACK_execute(node as SetFlagEventNode);
		},
	});
}
const ParamsConfig = new SetFlagParamsConfig();

export class SetFlagEventNode extends TypedEventNode<SetFlagParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'setFlag';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
		]);
	}
	override async processEvent(eventContext: EventContext<Event>) {
		let mask = this.pv.mask;
		if (eventContext.value) {
			const node = eventContext.value.node;
			if (node) {
				const parent = node.parent();
				if (parent) {
					mask = `${parent.path()}/${mask}`;
				}
			}
		}
		const nodes = this.scene().nodesController.nodesFromMask(mask);

		for (const node of nodes) {
			this._updateNodeFlags(node);
		}
	}
	private _updateNodeFlags(node: BaseNodeType) {
		this._updateNodeDisplayFlag(node);
		this._updateNodeBypassFlag(node);
	}
	private _updateNodeDisplayFlag(node: BaseNodeType) {
		if (!isBooleanTrue(this.pv.tdisplay)) {
			return;
		}
		if (!node.flags?.hasDisplay()) {
			return;
		}
		const displayFlag = node.flags.display;
		if (!displayFlag) {
			return;
		}
		const mode = FLAG_UPDATE_MODES[this.pv.displayMode];
		switch (mode) {
			case FlagUpdateMode.SET: {
				displayFlag.set(isBooleanTrue(this.pv.display));
				return;
			}
			case FlagUpdateMode.TOGGLE: {
				displayFlag.set(!displayFlag.active());
				return;
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _updateNodeBypassFlag(node: BaseNodeType) {
		if (!isBooleanTrue(this.pv.tbypass)) {
			return;
		}
		if (!node.flags?.hasBypass()) {
			return;
		}
		const bypassFlag = node.flags.bypass;
		if (!bypassFlag) {
			return;
		}
		const mode = FLAG_UPDATE_MODES[this.pv.bypassMode];
		switch (mode) {
			case FlagUpdateMode.SET: {
				bypassFlag.set(isBooleanTrue(this.pv.bypass));
				return;
			}
			case FlagUpdateMode.TOGGLE: {
				bypassFlag.set(!bypassFlag.active());
				return;
			}
		}
		TypeAssert.unreachable(mode);
	}

	static PARAM_CALLBACK_execute(node: SetFlagEventNode) {
		node.processEvent({});
	}
}
