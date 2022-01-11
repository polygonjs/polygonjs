/**
 * Allows to compose two different renders.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {LayerPass, LAYER_MODES} from '../../../modules/core/post_process/LayerPass';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EffectComposer} from '../../../modules/core/post_process/EffectComposer';
import {LinearFilter, RGBAFormat} from 'three/src/constants';
import {Poly} from '../../Poly';

class LayerPostParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: LAYER_MODES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new LayerPostParamsConfig();
export class LayerPostNode extends TypedPostProcessNode<LayerPass, LayerPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'layer';
	}

	initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(2);
	}

	setupComposer(context: TypedPostNodeContext): void {
		const renderer = context.composer.renderer;

		const parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: true,
		};
		const renderTarget1 = Poly.renderersController.renderTarget(
			renderer.domElement.offsetWidth,
			renderer.domElement.offsetHeight,
			parameters
		);
		const renderTarget2 = Poly.renderersController.renderTarget(
			renderer.domElement.offsetWidth,
			renderer.domElement.offsetHeight,
			parameters
		);
		const composer1 = new EffectComposer(renderer, renderTarget1);
		const composer2 = new EffectComposer(renderer, renderTarget2);
		// renderToScreen = false to ensure the last pass of each composer is still
		// written to the render_target
		composer1.renderToScreen = false;
		composer2.renderToScreen = false;

		const cloned_context1 = {...context};
		const cloned_context2 = {...context};
		cloned_context1.composer = composer1;
		cloned_context2.composer = composer2;
		this._addPassFromInput(0, cloned_context1);
		this._addPassFromInput(1, cloned_context2);

		const pass = new LayerPass(composer1, composer2);
		// pass.needsSwap = true;
		this.updatePass(pass);
		context.composer.addPass(pass);
	}

	updatePass(pass: LayerPass) {
		pass.mode = LAYER_MODES[this.pv.mode];
	}
}
