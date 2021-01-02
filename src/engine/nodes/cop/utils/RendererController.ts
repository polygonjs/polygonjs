import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {LinearToneMapping} from 'three/src/constants';
import {TypedCopNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Poly} from '../../../Poly';
class BaseCopRendererCopParamsConfig extends NodeParamsConfig {
	useCameraRenderer = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new BaseCopRendererCopParamsConfig();
export class BaseCopRendererCopNode extends TypedCopNode<BaseCopRendererCopParamsConfig> {
	params_config = ParamsConfig;
}

export class CopRendererController {
	private _renderer: WebGLRenderer | undefined;

	constructor(private node: BaseCopRendererCopNode) {}

	async renderer() {
		if (this.node.pv.useCameraRenderer) {
			return await this.camera_renderer();
		} else {
			return (this._renderer = this._renderer || this._create_renderer());
		}
	}
	reset() {
		this._renderer?.dispose();
		this._renderer = undefined;
	}

	async camera_renderer() {
		let renderer = Poly.instance().renderers_controller.first_renderer();
		if (renderer) {
			return renderer;
		} else {
			return await Poly.instance().renderers_controller.wait_for_renderer();
		}
	}

	save_state() {
		// const prev_target = renderer.getRenderTarget();
		// renderer.getSize(this._prev_renderer_size);
		// console.log('texture', texture);
		// const prev_pixel_aspect_ratio = renderer.getPixelRatio();
		// const prev_auto_clear: boolean = renderer.autoClear;
		// renderer.toneMappingExposure = 1;
		// renderer.outputEncoding = sRGBEncoding; // should be linear

		this.make_linear();
	}

	make_linear() {
		// renderer.outputEncoding = LinearEncoding
	}

	restore_state() {
		// renderer.setRenderTarget(prev_target);
		// renderer.setSize(this._prev_renderer_size.x, this._prev_renderer_size.y);
		// renderer.setPixelRatio(prev_pixel_aspect_ratio);
		// renderer.autoClear = prev_auto_clear;
	}

	private _create_renderer() {
		const renderer = new WebGLRenderer();
		renderer.toneMapping = LinearToneMapping;
		renderer.setPixelRatio(1);
		return renderer;
	}
}
