/**
 * Adds an effect pass, which can combine multiples passes into 1.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Effect, EffectPass, Pass} from 'postprocessing';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';

const POSSIBLE_COMBINED_PASSES_COUNT = 5;
const RANGE = ArrayUtils.range(POSSIBLE_COMBINED_PASSES_COUNT);
const DEFAULT_INPUTS_COUNT = POSSIBLE_COMBINED_PASSES_COUNT + 1;

class EffectPassPostParamsConfig extends NodeParamsConfig {
	/** @param number of inputs that this node can merge geometries from */
	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
		range: [1, 32],
		rangeLocked: [true, false],
		callback: (node: BaseNodeType) => {
			EffectPassPostNode.PARAM_CALLBACK_setInputsCount(node as EffectPassPostNode);
		},
	});
}
const ParamsConfig = new EffectPassPostParamsConfig();
export class EffectPassPostNode extends TypedPostProcessNode<EffectPass, EffectPassPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'effectPass';
	}

	static override displayedInputNames(): string[] {
		return ['input pass', ...RANGE.map((i) => `combined pass ${i}`)];
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(DEFAULT_INPUTS_COUNT);

		this.scene().dispatchController.onAddListener(() => {
			this.params.addOnSceneLoadHook('update inputs', () => {
				this._callbackUpdateInputsCount();
			});
		});
	}

	override _setupComposerIfActive(context: TypedPostNodeContext): void {
		const inputIndices = RANGE.map((i) => i + 1);
		const passesToCombine: Pass[] = ArrayUtils.compact(
			inputIndices.map((index) => {
				const input = this.io.inputs.input(index);
				if (input) {
					if (!input.flags.bypass.active()) {
						return input.createPassForContext(context);
					}
				}
			})
		).flat();

		const effects: Effect[] = ArrayUtils.compact(
			passesToCombine.map((pass) => {
				return (pass as any).effects as undefined | Effect[];
			})
		).flat();
		const pass = new EffectPass(context.camera, ...effects);
		context.composerController.addPassByNodeInBuildPassesProcess(this, pass, context.composer);
	}

	override updatePass(pass: EffectPass) {}

	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: EffectPassPostNode) {
		node._callbackUpdateInputsCount();
	}
}
