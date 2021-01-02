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
class DepthOfFieldPostParamsConfig extends NodeParamsConfig {
	focalDepth = ParamConfig.FLOAT(10, {
		range: [0, 50],
		rangeLocked: [true, false],
		step: 0.001,
		...PostParamOptions,
	});
	fStep = ParamConfig.FLOAT(10, {
		range: [0.1, 22],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	maxBlur = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	vignetting = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	depthBlur = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	threshold = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
		step: 0.001,
		...PostParamOptions,
	});
	gain = ParamConfig.FLOAT(1, {
		range: [0, 100],
		rangeLocked: [true, true],
		step: 0.001,
		...PostParamOptions,
	});
	bias = ParamConfig.FLOAT(1, {
		range: [0, 3],
		rangeLocked: [true, true],
		step: 0.001,
		...PostParamOptions,
	});
	fringe = ParamConfig.FLOAT(0.7, {
		range: [0, 5],
		rangeLocked: [true, false],
		step: 0.001,
		...PostParamOptions,
	});
	noise = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	dithering = ParamConfig.FLOAT(0, {
		range: [0, 0.001],
		rangeLocked: [true, true],
		step: 0.0001,
		...PostParamOptions,
	});
	pentagon = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	rings = ParamConfig.INTEGER(3, {
		range: [1, 8],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	samples = ParamConfig.INTEGER(4, {
		range: [1, 13],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	clearColor = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
}
const ParamsConfig = new DepthOfFieldPostParamsConfig();
export class DepthOfFieldPostNode extends TypedPostProcessNode<BokehPass2, DepthOfFieldPostParamsConfig> {
	params_config = ParamsConfig;

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

	protected _create_pass(context: TypedPostNodeContext) {
		const camera = context.camera;
		if ((camera as PerspectiveCamera).isPerspectiveCamera) {
			const camera_node = context.camera_node as PerspectiveCameraObjNode;
			if (camera_node) {
				const pass = new BokehPass2(this, context.scene, camera_node.object, context.resolution);

				this.update_pass(pass);

				// TODO: add a dispose to get rid of those connections when the node is deleted
				// or when the camera is deleted
				// and maybe the graph node should be on the pass itself?
				// so that it can be called when we call .dispose() on it?
				const core_graph_node = new CoreGraphNode(this.scene, 'DOF');
				core_graph_node.add_graph_input(camera_node.p.near);
				core_graph_node.add_graph_input(camera_node.p.far);
				core_graph_node.add_graph_input(camera_node.p.fov);
				core_graph_node.add_graph_input(this.p.focalDepth);
				core_graph_node.add_post_dirty_hook('post/DOF', () => {
					this.update_pass_from_camera_node(pass, camera_node);
				});

				return pass;
			}
		}
	}
	update_pass_from_camera_node(pass: BokehPass2, camera: PerspectiveCameraObjNode) {
		pass.update_camera_uniforms_with_node(this, camera.object);
	}
	update_pass(pass: BokehPass2) {
		pass.bokeh_uniforms['fstop'].value = this.pv.fStep;
		pass.bokeh_uniforms['maxblur'].value = this.pv.maxBlur;

		pass.bokeh_uniforms['threshold'].value = this.pv.threshold;
		pass.bokeh_uniforms['gain'].value = this.pv.gain;
		pass.bokeh_uniforms['bias'].value = this.pv.bias;
		pass.bokeh_uniforms['fringe'].value = this.pv.fringe;
		pass.bokeh_uniforms['dithering'].value = this.pv.dithering;

		// booleans
		pass.bokeh_uniforms['noise'].value = this.pv.noise ? 1 : 0;
		pass.bokeh_uniforms['pentagon'].value = this.pv.pentagon ? 1 : 0;
		pass.bokeh_uniforms['vignetting'].value = this.pv.vignetting ? 1 : 0;
		pass.bokeh_uniforms['depthblur'].value = this.pv.depthBlur ? 1 : 0;

		// debug
		pass.bokeh_uniforms['shaderFocus'].value = 0;
		pass.bokeh_uniforms['showFocus'].value = 0;
		pass.bokeh_uniforms['manualdof'].value = 0;
		pass.bokeh_uniforms['focusCoords'].value.set(0.5, 0.5);

		pass.bokeh_material.defines['RINGS'] = this.pv.rings;
		pass.bokeh_material.defines['SAMPLES'] = this.pv.samples;
		pass.bokeh_material.needsUpdate = true;

		pass.clear_color.copy(this.pv.clearColor);
	}
}
