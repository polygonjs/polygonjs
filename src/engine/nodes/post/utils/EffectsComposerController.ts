import {Constructor, PolyDictionary, valueof} from '../../../../types/GlobalTypes';
import {WebGLRenderer} from 'three';
import {WebGLRenderTargetOptions} from 'three';
import {EffectComposer} from '../../../../modules/core/post_process/EffectComposer';
import {RenderPass} from '../../../../modules/three/examples/jsm/postprocessing/RenderPass';
import {DisplayNodeController, DisplayNodeControllerCallbacks} from '../../utils/DisplayNodeController';
import {PostNodeChildrenMap} from '../../../poly/registers/nodes/Post';
import {TypedNode, BaseNodeType} from '../../_Base';
import {BasePostProcessNodeType} from '../_Base';
import {Scene} from 'three';
import {Camera} from 'three';
import {Vector2} from 'three';
import {BaseCameraObjNodeType} from '../../obj/_BaseCamera';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {RGBAFormat, UnsignedByteType, HalfFloatType, FloatType} from 'three';
import {Poly} from '../../../Poly';

import {
	MAG_FILTER_DEFAULT_VALUE,
	MAG_FILTER_MENU_ENTRIES,
	MIN_FILTER_DEFAULT_VALUE,
	MIN_FILTER_MENU_ENTRIES,
} from '../../../../core/cop/Filter';
import {isBooleanTrue} from '../../../../core/BooleanValue';

// const RENDER_TARGET_FORMATS_OPTIONS: PolyDictionary<number> = {
// 	RGBFormat: RGBFormat,
// 	RGBAFormat: RGBAFormat,
// };
// const RENDER_TARGET_FORMATS_MENU_ENTRIES = Object.keys(RENDER_TARGET_FORMATS_OPTIONS)
// 	.sort()
// 	.map((name) => {
// 		return {
// 			name,
// 			value: RENDER_TARGET_FORMATS_OPTIONS[name] as number,
// 		};
// 	});

const RENDER_TARGET_TEXTURE_TYPE_OPTIONS: PolyDictionary<number> = {
	UnsignedByteType: UnsignedByteType,
	HalfFloatType: HalfFloatType,
	FloatType: FloatType,
};
const RENDER_TARGET_TEXTURE_TYPE_MENU_ENTRIES = Object.keys(RENDER_TARGET_TEXTURE_TYPE_OPTIONS).map((name) => {
	return {
		name,
		value: RENDER_TARGET_TEXTURE_TYPE_OPTIONS[name] as number,
	};
});

export class PostProcessNetworkParamsConfig extends NodeParamsConfig {
	prependRenderPass = ParamConfig.BOOLEAN(1);
	// format = ParamConfig.INTEGER(RGBAFormat, {
	// 	menu: {
	// 		entries: RENDER_TARGET_FORMATS_MENU_ENTRIES,
	// 	},
	// });
	textureType = ParamConfig.INTEGER(UnsignedByteType, {
		menu: {
			entries: RENDER_TARGET_TEXTURE_TYPE_MENU_ENTRIES,
		},
	});
	tmagFilter = ParamConfig.BOOLEAN(0);
	magFilter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
		visibleIf: {tmagFilter: 1},
		menu: {
			entries: MAG_FILTER_MENU_ENTRIES,
		},
	});
	tminFilter = ParamConfig.BOOLEAN(0);
	minFilter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
		visibleIf: {tminFilter: 1},
		menu: {
			entries: MIN_FILTER_MENU_ENTRIES,
		},
	});
	stencilBuffer = ParamConfig.BOOLEAN(0);
	sampling = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, false],
	});
}
export interface BaseNetworkPostProcessNodeType extends TypedNode<any, PostProcessNetworkParamsConfig> {
	readonly displayNodeController: DisplayNodeController;
	createNode<S extends keyof PostNodeChildrenMap>(node_class: S): PostNodeChildrenMap[S];
	createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>): K;
	children(): BasePostProcessNodeType[];
	nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];

	readonly effectsComposerController: EffectsComposerController;
}

interface CreateEffectsComposerOptions {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: Camera;
	resolution: Vector2;
	// render_target?: WebGLRenderTarget;
	requester: BaseNodeType;
	camera_node?: BaseCameraObjNodeType;
	// useRenderTarget?: boolean;
	// prepend_render_pass?: boolean;
}
export interface RenderTargetCreateOptions {
	width: number;
	height: number;
}

export class EffectsComposerController {
	constructor(private node: BaseNetworkPostProcessNodeType) {}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {},
			onDisplayNodeSet: () => {
				this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				this.node.setDirty();
			},
		};
	}

	createEffectsComposer(options: CreateEffectsComposerOptions) {
		const renderer = options.renderer;

		let composer: EffectComposer;
		//if (isBooleanTrue(this.node.pv.useRenderTarget)) {
		const renderTarget = this.createRenderTarget(renderer);
		composer = new EffectComposer(renderer, renderTarget);
		// } else {
		// 	composer = new EffectComposer(renderer);
		// }

		// to achieve better antialiasing
		// while using post:
		composer.setPixelRatio(window.devicePixelRatio * this.node.pv.sampling);
		// be careful, as this messes up with the renderer
		// and when using in cop/post has the output texture be 2x as large
		// composer.setPixelRatio(window.devicePixelRatio * 1);

		this._buildPasses(composer, options);

		return composer;
	}

	private _rendererSize = new Vector2();
	createRenderTarget(renderer: WebGLRenderer, options?: RenderTargetCreateOptions) {
		renderer.autoClear = false;
		const pv = this.node.pv;
		const parameters: WebGLRenderTargetOptions = {
			format: RGBAFormat,
			type: pv.textureType,
			stencilBuffer: isBooleanTrue(pv.stencilBuffer),
		};
		if (isBooleanTrue(pv.tminFilter)) {
			parameters.minFilter = pv.minFilter;
		}
		if (isBooleanTrue(pv.tmagFilter)) {
			parameters.magFilter = pv.magFilter;
		}

		renderer.getDrawingBufferSize(this._rendererSize);
		const renderTarget = Poly.renderersController.renderTarget(
			options?.width || this._rendererSize.x,
			options?.height || this._rendererSize.y,
			parameters
		);
		return renderTarget;
	}

	private _buildPasses(composer: EffectComposer, options: CreateEffectsComposerOptions) {
		if (isBooleanTrue(this.node.pv.prependRenderPass)) {
			const renderPass = new RenderPass(options.scene, options.camera);
			composer.addPass(renderPass);
		}

		const postNode = this.node.displayNodeController.displayNode() as BasePostProcessNodeType;
		if (postNode) {
			postNode.setupComposer({
				composer: composer,
				camera: options.camera,
				resolution: options.resolution,
				camera_node: options.camera_node,
				scene: options.scene,
				requester: options.requester,
			});
		}
	}
}
