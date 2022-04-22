import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {NodeContext} from '../../../../poly/NodeContext';
import {RootManagerNode} from '../../Root';
import {ColorConversion} from '../../../../../core/Color';
import {Color} from 'three';
import {TypeAssert} from '../../../../poly/Assert';

export enum BackgroundMode {
	NONE = 'none',
	COLOR = 'color',
	TEXTURE = 'texture',
}
export const BACKGROUND_MODES: BackgroundMode[] = [BackgroundMode.NONE, BackgroundMode.COLOR, BackgroundMode.TEXTURE];

const CallbackOptions = {
	// computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneBackgroundController.update(node as RootManagerNode);
	},
};

export function SceneBackgroundParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// background
		/** @param set background mode (none, color or texture). Note that in order to have a transparent background, you also need to set the renderer's alpha to true. In order to do so, you may need to create a rop/WebGLRenderer node, set it alpha parameter, and assign the node to your camera. */
		backgroundMode = ParamConfig.INTEGER(BACKGROUND_MODES.indexOf(BackgroundMode.COLOR), {
			menu: {
				entries: BACKGROUND_MODES.map((mode, i) => {
					return {name: mode, value: i};
				}),
			},
			...CallbackOptions,
			separatorBefore: true,
		});
		/** @param background color */
		bgColor = ParamConfig.COLOR([0.4, 0.4, 0.4], {
			visibleIf: {backgroundMode: BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)},
			...CallbackOptions,
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param background texture */
		bgTexture = ParamConfig.NODE_PATH('', {
			visibleIf: {backgroundMode: BACKGROUND_MODES.indexOf(BackgroundMode.TEXTURE)},
			nodeSelection: {
				context: NodeContext.COP,
			},
			dependentOnFoundNode: false,
			...CallbackOptions,
		});
	};
}

export class SceneBackgroundController {
	constructor(protected node: RootManagerNode) {}
	setMode(mode: BackgroundMode) {
		this.node.p.backgroundMode.set(BACKGROUND_MODES.indexOf(mode));
	}
	backgroundMode(): BackgroundMode {
		return BACKGROUND_MODES[this.node.pv.backgroundMode];
	}
	async update() {
		const backgroundMode = this.backgroundMode();
		switch (backgroundMode) {
			case BackgroundMode.NONE: {
				return this._setBackgroundNone();
			}
			case BackgroundMode.COLOR: {
				return await this._setBackgroundColor();
			}
			case BackgroundMode.TEXTURE: {
				return await this._setBackgroundTexture();
			}
		}
		TypeAssert.unreachable(backgroundMode);
	}

	private _setBackgroundNone() {
		const scene = this.node.object;
		scene.background = null;
	}
	private async _setBackgroundColor() {
		const scene = this.node.object;
		const pv = this.node.pv;
		await this.node.p.bgColor.compute();
		if (scene.background && scene.background instanceof Color) {
			scene.background.copy(pv.bgColor);
		} else {
			scene.background = pv.bgColor;
		}
	}
	private async _setBackgroundTexture() {
		const scene = this.node.object;
		const pv = this.node.pv;
		const node = pv.bgTexture.nodeWithContext(NodeContext.COP);
		if (node) {
			const container = await node.compute();
			scene.background = container.texture();
		} else {
			this.node.states.error.set('bgTexture node not found');
		}
	}

	static update(node: RootManagerNode) {
		node.sceneBackgroundController.update();
	}
}
