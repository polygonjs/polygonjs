import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

enum Easing {
	NONE = 'none',
	POWER1 = 'power1',
	POWER2 = 'power2',
	POWER3 = 'power3',
	POWER4 = 'power4',
	BACK = 'back',
	ELASTIC = 'elastic',
	BOUNCE = 'bounce',
	// rough
	SLOW = 'slow',
	STEPS = 'steps',
	CIRC = 'circ',
	EXPO = 'expo',
	SINE = 'sine',
	// Custom
}
const EASINGS: Easing[] = [
	Easing.NONE,
	Easing.POWER1,
	Easing.POWER2,
	Easing.POWER3,
	Easing.POWER4,
	Easing.BACK,
	Easing.ELASTIC,
	Easing.BOUNCE,

	Easing.SLOW,
	Easing.STEPS,
	Easing.CIRC,
	Easing.EXPO,
	Easing.SINE,
];
enum InOutMode {
	IN = 'in',
	OUT = 'out',
	IN_OUT = 'inOut',
}
const IN_OUT_MODES: InOutMode[] = [InOutMode.IN, InOutMode.OUT, InOutMode.IN_OUT];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class EasingAnimParamsConfig extends NodeParamsConfig {
	name = ParamConfig.INTEGER(EASINGS.indexOf(Easing.POWER4), {
		menu: {
			entries: EASINGS.map((name, value) => {
				return {name, value};
			}),
		},
	});
	in_out = ParamConfig.INTEGER(IN_OUT_MODES.indexOf(InOutMode.OUT), {
		menu: {
			entries: IN_OUT_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new EasingAnimParamsConfig();

export class EasingAnimNode extends TypedAnimNode<EasingAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'easing';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name, this.p.in_out], () => {
					return this.easing_full_name();
				});
			});
		});
	}

	private easing_full_name() {
		const easing = EASINGS[this.pv.name];
		if (easing == Easing.NONE) {
			return easing;
		}
		const in_out = IN_OUT_MODES[this.pv.in_out];
		const easing_full_name = `${easing}.${in_out}`;
		return easing_full_name;
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		const easing_full_name = this.easing_full_name();
		timeline_builder.set_easing(easing_full_name);

		this.set_timeline_builder(timeline_builder);
	}
}
