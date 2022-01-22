/**
 * Adds a depth of field effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {BokehPass2} from '../../../modules/core/post_process/BokehPass2';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {PerspectiveCameraObjNode} from '../obj/PerspectiveCamera';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BaseParamType} from '../../params/_Base';
class DepthOfFieldPostParamsConfig extends NodeParamsConfig {
	/** @param focalDepth */
	focalDepth = ParamConfig.FLOAT(10, {
		range: [0, 50],
		rangeLocked: [true, false],
		step: 0.001,
		...PostParamOptions,
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
}
const ParamsConfig = new DepthOfFieldPostParamsConfig();
export class DepthOfFieldPostNode extends TypedPostProcessNode<BokehPass2, DepthOfFieldPostParamsConfig> {
	paramsConfig = ParamsConfig;

	static type() {
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

	protected _createPass(context: TypedPostNodeContext) {
		const camera = context.camera;
		if ((camera as PerspectiveCamera).isPerspectiveCamera) {
			const cameraNode = context.camera_node as PerspectiveCameraObjNode;
			if (cameraNode) {
				const pass = new BokehPass2(this, context.scene, cameraNode.object, context.resolution);

				this.updatePass(pass);

				// TODO: add a dispose to get rid of those connections when the node is deleted
				// or when the camera is deleted
				// and maybe the graph node should be on the pass itself?
				// so that it can be called when we call .dispose() on it?
				const coreGraphNode = new CoreGraphNode(this.scene(), 'DOF');
				const params: BaseParamType[] = [
					cameraNode.p.near,
					cameraNode.p.far,
					cameraNode.p.fov,
					this.p.focalDepth,
				];
				for (let param of params) {
					coreGraphNode.addGraphInput(param);
				}
				coreGraphNode.addPostDirtyHook('post/DOF', async (triggerNode: CoreGraphNode | undefined) => {
					if (triggerNode) {
						const triggerParam: BaseParamType = triggerNode as BaseParamType;
						if (params.includes(triggerParam)) {
							await triggerParam.compute();
							console.log('CoreGraphNode', triggerParam);
						}
					}
					this._updatePassFromCameraNode(pass, cameraNode);
				});
				// on scene initialization,
				// we need to make sure the camera is cooked properly
				cameraNode.compute().then(() => {
					this._updatePassFromCameraNode(pass, cameraNode);
				});

				return pass;
			}
		}
	}
	private async _updatePassFromCameraNode(pass: BokehPass2, camera: PerspectiveCameraObjNode) {
		pass.updateCameraUniformsWithNode(this, camera.object);
	}
	updatePass(pass: BokehPass2) {
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
	}
}
