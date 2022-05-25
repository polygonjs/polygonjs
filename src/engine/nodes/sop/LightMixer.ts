/**
 * Mixes the input lights
 *
 * @remarks
 * Note that if the input lights have helpers, those will not update to reflect correctly the new light color and intensity. Only the actual lighting on the scene will be as expected.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Light} from 'three';
import {ParamOptionToAdd} from '../utils/params/ParamsController';
import {ParamType} from '../../poly/ParamType';
import {FloatParam} from '../../params/Float';
import {ColorParam} from '../../params/Color';
import {Number3} from '../../../types/GlobalTypes';

enum SUFFIX {
	INTENSITY = '_int',
	COLOR = '_col',
}
function intensityParamName(lightName: string) {
	return `${lightName}${SUFFIX.INTENSITY}`;
}
function colorParamName(lightName: string) {
	return `${lightName}${SUFFIX.COLOR}`;
}

class LightMixerParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	setup = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LightMixerSopNode.PARAM_CALLBACK_setup(node as LightMixerSopNode);
		},
	});
}
const ParamsConfig = new LightMixerParamsConfig();

export class LightMixerSopNode extends TypedSopNode<LightMixerParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'lightMixer';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	private _lightsByName: Map<string, Light> = new Map();
	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		this._findLights(coreGroup);

		this._lightsByName.forEach((light, lightName) => {
			const intensityParam = this.params.get(intensityParamName(lightName));
			const colorParam = this.params.get(colorParamName(lightName));

			if (intensityParam && intensityParam instanceof FloatParam) {
				light.intensity = intensityParam.value;
			}
			if (colorParam && colorParam instanceof ColorParam) {
				light.color.copy(colorParam.value);
			}
		});

		this.setCoreGroup(coreGroup);
	}

	private _findLights(coreGroup: CoreGroup) {
		this._lightsByName.clear();
		const objects = coreGroup.objects();
		for (let object of objects) {
			object.traverse((child) => {
				if ((child as Light).isLight) {
					this._lightsByName.set(child.name, child as Light);
				}
			});
		}
	}

	static PARAM_CALLBACK_setup(node: LightMixerSopNode) {
		node._paramCallbackSetup();
	}
	private async _paramCallbackSetup() {
		this.states.error.clear();
		this.params.updateParams({namesToDelete: this.params.spare.map((p) => p.name())});

		const inputNode = this.io.inputs.input(0);
		if (!inputNode) {
			this.states.error.set('no input node');
			return;
		}
		const container = await inputNode.compute();
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.states.error.set('failed to cook input node');
			return;
		}

		this._findLights(coreGroup);

		const paramsDataToAdd: ParamOptionToAdd<ParamType>[] = [];
		this._lightsByName.forEach((light, lightName) => {
			const intensity: ParamOptionToAdd<ParamType.FLOAT> = {
				name: intensityParamName(lightName),
				type: ParamType.FLOAT,
				initValue: light.intensity,
				rawInput: light.intensity,
				options: {
					range: [0, 2],
					rangeLocked: [true, false],
					spare: true,
				},
			};
			const color: ParamOptionToAdd<ParamType.COLOR> = {
				name: colorParamName(lightName),
				type: ParamType.COLOR,
				initValue: light.color.toArray() as Number3,
				rawInput: light.color.toArray() as Number3,
				options: {
					separatorAfter: true,
					spare: true,
				},
			};
			paramsDataToAdd.push(intensity);
			paramsDataToAdd.push(color);
		});

		this.params.updateParams({toAdd: paramsDataToAdd});
	}
}
