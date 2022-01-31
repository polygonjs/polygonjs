import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {NodeContext} from '../../../../poly/NodeContext';
import {RootManagerNode} from '../../Root';
import {ColorConversion} from '../../../../../core/Color';
import {Color} from 'three/src/math/Color';

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
		/** @param set background mode (none, color or texture) */
		backgroundMode = ParamConfig.INTEGER(BACKGROUND_MODES.indexOf(BackgroundMode.NONE), {
			menu: {
				entries: BACKGROUND_MODES.map((mode, i) => {
					return {name: mode, value: i};
				}),
			},
			...CallbackOptions,
		});
		/** @param background color */
		bgColor = ParamConfig.COLOR([0, 0, 0], {
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

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (pv.backgroundMode == BACKGROUND_MODES.indexOf(BackgroundMode.NONE)) {
			scene.background = null;
		} else {
			if (pv.backgroundMode == BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)) {
				// without the compute,
				// the color does not seem to update correctly when changing the conversion
				await this.node.p.bgColor.compute();
				if (scene.background && scene.background instanceof Color) {
					scene.background.copy(pv.bgColor);
				} else {
					scene.background = pv.bgColor;
				}
			} else {
				const node = pv.bgTexture.nodeWithContext(NodeContext.COP);
				if (node) {
					node.compute().then((container) => {
						scene.background = container.texture();
					});
				} else {
					this.node.states.error.set('bgTexture node not found');
				}
			}
		}
	}
	static update(node: RootManagerNode) {
		node.sceneBackgroundController.update();
	}
}
