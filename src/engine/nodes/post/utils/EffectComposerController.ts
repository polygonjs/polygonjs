import {Constructor, PolyDictionary, valueof} from '../../../../types/GlobalTypes';
import {WebGLRenderer, Scene, Camera, UnsignedByteType, HalfFloatType, FloatType} from 'three';
import {EffectComposer, RenderPass, Pass} from 'postprocessing';
import {DisplayNodeController, DisplayNodeControllerCallbacks} from '../../utils/DisplayNodeController';
import {PostNodeChildrenMap} from '../../../poly/registers/nodes/Post';
import {BaseNodeType, TypedNode} from '../../_Base';
import {BasePostProcessNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {BaseViewerType} from '../../../viewers/_Base';
import {WithPolyId} from '../../../poly/RenderersController';

export interface POLYEffectComposer extends EffectComposer, WithPolyId {}

export type PostProcessingTextureType = typeof UnsignedByteType | typeof HalfFloatType | typeof FloatType;
const RENDER_TARGET_TEXTURE_TYPE_OPTIONS: PolyDictionary<PostProcessingTextureType> = {
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
export function postProcessTextureTypeLabel(value: number) {
	for (const entry of RENDER_TARGET_TEXTURE_TYPE_MENU_ENTRIES) {
		if (entry.value == value) {
			return entry.name;
		}
	}
}

export function PostProcessNetworkParamsConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		prependRenderPass = ParamConfig.BOOLEAN(1, {
			separatorAfter: true,
		});
		depthBuffer = ParamConfig.BOOLEAN(1);
		stencilBuffer = ParamConfig.BOOLEAN(0);
		sampling = ParamConfig.INTEGER(0, {
			range: [0, 4],
			rangeLocked: [true, false],
		});
		tTextureType = ParamConfig.BOOLEAN(0);
		textureType = ParamConfig.INTEGER(UnsignedByteType, {
			visibleIf: {tTextureType: 1},
			menu: {
				entries: RENDER_TARGET_TEXTURE_TYPE_MENU_ENTRIES,
			},
		});
	};
}
export class PostProcessNetworkParamsConfig extends PostProcessNetworkParamsConfigMixin(NodeParamsConfig) {}
export interface BaseNetworkPostProcessNodeType extends TypedNode<any, PostProcessNetworkParamsConfig> {
	readonly displayNodeController: DisplayNodeController;
	createNode<S extends keyof PostNodeChildrenMap>(node_class: S): PostNodeChildrenMap[S];
	createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>): K;
	children(): BasePostProcessNodeType[];
	nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];

	readonly effectsComposerController: EffectComposerController;
}

interface CreateEffectsComposerOptions {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: Camera;
	viewer: BaseViewerType;
	// resolution: Vector2;
	// render_target?: WebGLRenderTarget;
	// requester: BaseNodeType;
	// useRenderTarget?: boolean;
	// prepend_render_pass?: boolean;
}
interface ComposerAndOptions {
	options: CreateEffectsComposerOptions;
	composer: EffectComposer;
}
export interface RenderTargetCreateOptions {
	width: number;
	height: number;
}

export class EffectComposerController {
	private _composerAndOptionsByCamera: Map<Camera, ComposerAndOptions> = new Map();
	constructor(private node: BaseNetworkPostProcessNodeType) {
		this.node.dirtyController.addPostDirtyHook('EffectComposerController', () => {
			this._updateComposers();
		});
	}

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
	private _nextId = 0;
	createEffectsComposer(options: CreateEffectsComposerOptions) {
		const renderer = options.renderer;

		const pv = this.node.pv;

		const composer = new EffectComposer(renderer, {
			depthBuffer: isBooleanTrue(pv.depthBuffer),
			stencilBuffer: isBooleanTrue(pv.stencilBuffer),
			multisampling: pv.sampling,
			frameBufferType: isBooleanTrue(pv.tTextureType) ? pv.textureType : undefined,
		});
		(composer as POLYEffectComposer)._polygonId = this._nextId++;
		return composer;
	}

	createEffectsComposerAndBuildPasses(options: CreateEffectsComposerOptions) {
		const composer = this.createEffectsComposer(options);
		this._composerAndOptionsByCamera.set(options.camera, {composer, options});

		this._buildPasses(composer, options);

		return composer;
	}

	private _updateComposers() {
		this._composerAndOptionsByCamera.forEach(({composer, options}) => {
			this._buildPasses(composer, options);
		});
	}

	private _passByNodeInBuildPassesProcess: Map<BaseNodeType, Pass> = new Map();
	addPassByNodeInBuildPassesProcess(node: BaseNodeType, pass: Pass, composer: EffectComposer) {
		this._passByNodeInBuildPassesProcess.set(node, pass);
		composer.addPass(pass);
	}
	// passByNodeInBuildPassesProcess(node: BaseNodeType) {
	// 	return this._passByNodeInBuildPassesProcess.get(node);
	// }
	private _buildPasses(composer: EffectComposer, options: CreateEffectsComposerOptions) {
		this._passByNodeInBuildPassesProcess.clear();

		composer.removeAllPasses();

		if (isBooleanTrue(this.node.pv.prependRenderPass)) {
			const renderPass = new RenderPass(options.scene, options.camera);
			composer.addPass(renderPass);
		}

		const postNode = this.node.displayNodeController.displayNode() as BasePostProcessNodeType;
		if (postNode) {
			postNode.setupComposer({
				composerController: this,
				composer: composer,
				camera: options.camera,
				renderer: options.renderer,
				// resolution: options.resolution,
				scene: options.scene,
				// requester: options.requester,
				viewer: options.viewer,
			});
		} else {
			console.warn(`no displayNode found inside '${this.node.path()}'`);
		}
		this._passByNodeInBuildPassesProcess.clear();
	}
}
