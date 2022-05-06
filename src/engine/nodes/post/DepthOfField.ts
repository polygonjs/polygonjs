/**
 * Adds a depth of field effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {BokehPass2} from '../../../modules/core/post_process/BokehPass2';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PerspectiveCamera, Vector2} from 'three';
import {isBooleanTrue} from '../../../core/BooleanValue';
class DepthOfFieldPostParamsConfig extends NodeParamsConfig {
	/** @param focalDepth */
	focalDepth = ParamConfig.FLOAT(10, {
		range: [0, 50],
		rangeLocked: [true, false],
		step: 0.001,
		cook: false,
	});
	/** @param fStep */
	fStep = ParamConfig.FLOAT(10, {
		range: [0.1, 22],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param maxBlur */
	maxBlur = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param vignetting */
	vignetting = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param depthBlur */
	depthBlur = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param threshold */
	threshold = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
		step: 0.001,
		...PostParamOptions,
	});
	/** @param gain */
	gain = ParamConfig.FLOAT(1, {
		range: [0, 100],
		rangeLocked: [true, true],
		step: 0.001,
		...PostParamOptions,
	});
	/** @param bias */
	bias = ParamConfig.FLOAT(1, {
		range: [0, 3],
		rangeLocked: [true, true],
		step: 0.001,
		...PostParamOptions,
	});
	/** @param fringe */
	fringe = ParamConfig.FLOAT(0.7, {
		range: [0, 5],
		rangeLocked: [true, false],
		step: 0.001,
		...PostParamOptions,
	});
	/** @param noise */
	noise = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param dithering */
	dithering = ParamConfig.FLOAT(0, {
		range: [0, 0.001],
		rangeLocked: [true, true],
		step: 0.0001,
		...PostParamOptions,
	});
	/** @param pentagon */
	pentagon = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param rings */
	rings = ParamConfig.INTEGER(3, {
		range: [1, 8],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param samples */
	samples = ParamConfig.INTEGER(4, {
		range: [1, 13],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param clearColor */
	clearColor = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	/** @param display depth pass that is used internally */
	debug = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
}
const ParamsConfig = new DepthOfFieldPostParamsConfig();
export class DepthOfFieldPostNode extends TypedPostProcessNode<BokehPass2, DepthOfFieldPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'depthOfField';
	}

	static saturate(x: number) {
		return Math.max(0, Math.min(1, x));
	}

	static linearize(depth: number, near: number, far: number) {
		var zfar = far;
		var znear = near;
		return (-zfar * znear) / (depth * (zfar - znear) - zfar);
	}

	static smoothstep(near: number, far: number, depth: number) {
		var x = this.saturate((depth - near) / (far - near));
		return x * x * (3 - 2 * x);
	}

	private _rendererSize = new Vector2();
	protected override _createPass(context: TypedPostNodeContext) {
		const camera = context.camera;
		if ((camera as PerspectiveCamera).isPerspectiveCamera) {
			const perspectiveCamera = camera as PerspectiveCamera;
			context.renderer.getSize(this._rendererSize);
			const pass = new BokehPass2(this, context.scene, perspectiveCamera, this._rendererSize);

			// UPDATE: now that cameras can be created at the geometry level,
			// we cannot track when the camera node is updated,
			// so it seems best to update the camera uniforms on every render.
			// (and that is done inside the pass)
			// if (camera instanceof PerspectiveCamera) {
			// pass.updateCameraUniformsWithNode(this, camera);
			// }
			this.updatePass(pass);

			return pass;
		}
	}
	override updatePass(pass: BokehPass2) {
		pass.bokehUniforms['fstop'].value = this.pv.fStep;
		pass.bokehUniforms['maxblur'].value = this.pv.maxBlur;

		pass.bokehUniforms['threshold'].value = this.pv.threshold;
		pass.bokehUniforms['gain'].value = this.pv.gain;
		pass.bokehUniforms['bias'].value = this.pv.bias;
		pass.bokehUniforms['fringe'].value = this.pv.fringe;
		pass.bokehUniforms['dithering'].value = this.pv.dithering;

		// booleans
		pass.bokehUniforms['noise'].value = isBooleanTrue(this.pv.noise) ? 1 : 0;
		pass.bokehUniforms['pentagon'].value = isBooleanTrue(this.pv.pentagon) ? 1 : 0;
		pass.bokehUniforms['vignetting'].value = isBooleanTrue(this.pv.vignetting) ? 1 : 0;
		pass.bokehUniforms['depthblur'].value = isBooleanTrue(this.pv.depthBlur) ? 1 : 0;

		// debug
		pass.bokehUniforms['shaderFocus'].value = 0;
		pass.bokehUniforms['showFocus'].value = 0;
		pass.bokehUniforms['manualdof'].value = 0;
		pass.bokehUniforms['focusCoords'].value.set(0.5, 0.5);

		pass.bokehMaterial.defines['RINGS'] = this.pv.rings;
		pass.bokehMaterial.defines['SAMPLES'] = this.pv.samples;
		pass.bokehMaterial.needsUpdate = true;

		pass.clearColor.copy(this.pv.clearColor);

		pass.displayDepth = this.pv.debug;
	}
}
