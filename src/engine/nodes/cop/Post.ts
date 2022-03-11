import {Constructor, valueof} from '../../../types/GlobalTypes';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {
	FloatType,
	HalfFloatType,
	NearestFilter,
	ClampToEdgeWrapping,
	RGBAFormat,
	LinearFilter,
} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Camera} from 'three/src/cameras/Camera';
import {TypedCopNode} from './_Base';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {EffectsComposerController, PostProcessNetworkParamsConfig} from '../post/utils/EffectsComposerController';
// import {Poly} from '../../Poly';
import {Texture} from 'three/src/textures/Texture';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector2} from 'three/src/math/Vector2';
import {EffectComposer} from '../../../modules/core/post_process/EffectComposer';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {ParamConfig} from '../utils/params/ParamsConfig';
import {CopRendererController} from './utils/RendererController';
import {CoreUserAgent} from '../../../core/UserAgent';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {isBooleanTrue} from '../../../core/Type';

const VERTEX_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;
const FRAGMENT_SHADER = `
uniform vec2 resolution;
uniform sampler2D map;

void main() {
	vec2 uv = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y);
	vec4 map_val = texture2D(map, uv);
	gl_FragColor = vec4(map_val);
}`;

const wrapS = ClampToEdgeWrapping;
const wrapT = ClampToEdgeWrapping;

const minFilter = LinearFilter;
const magFilter = NearestFilter;
const parameters1 = {
	wrapS: wrapS,
	wrapT: wrapT,
	minFilter: minFilter,
	magFilter: magFilter,
	format: RGBAFormat,
	type: CoreUserAgent.isiOS() ? HalfFloatType : FloatType,
	stencilBuffer: false,
	depthBuffer: false,
};
const parameters2 = {
	minFilter: LinearFilter,
	magFilter: LinearFilter,
	format: RGBAFormat,
	stencilBuffer: false,
};

const data_type1 = DataTextureControllerBufferType.Float32Array;
const data_type2 = DataTextureControllerBufferType.Uint8Array;

const OPTION_SETS = {
	data1: {
		data_type: data_type1,
		params: parameters1,
	},
	data2: {
		data_type: data_type2,
		params: parameters2,
	},
};
const OPTION_SET = OPTION_SETS.data2;

// class PostCopParamsConfig extends NodeParamsConfig {
// 	use_camera_renderer = ParamConfig.BOOLEAN(0);
// }

class PostProcessCopNetworkParamsConfig extends PostProcessNetworkParamsConfig {
	useCameraRenderer = ParamConfig.BOOLEAN(0);
}

const ParamsConfig = new PostProcessCopNetworkParamsConfig();

// TODO:
// when the params of the children post nodes are updated,
// this node currently does not re-render
export class PostCopNode extends TypedCopNode<PostProcessCopNetworkParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'post';
	}

	private _textureMesh: Mesh = new Mesh(new PlaneBufferGeometry(2, 2));
	private _textureMaterial: ShaderMaterial = new ShaderMaterial({
		uniforms: {
			map: {value: null},
			resolution: {value: null},
		},
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});
	private _textureScene: Scene = new Scene();
	private _textureCamera: Camera = new Camera();
	private _renderTarget: WebGLRenderTarget | undefined;
	protected _composer: EffectComposer | undefined;
	private _composerResolution: Vector2 = new Vector2();
	// private _prev_renderer_size: Vector2 = new Vector2();
	private _dataTextureController: DataTextureController | undefined;
	private _rendererController: CopRendererController | undefined;

	readonly effectsComposerController: EffectsComposerController = new EffectsComposerController(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.effectsComposerController.displayNodeControllerCallbacks()
	);

	protected override _childrenControllerContext = NodeContext.POST;
	override initializeNode() {
		this.io.inputs.setCount(1);

		// init scene
		this._textureMesh.name = 'cop/post';
		this._textureScene.name = 'cop/post';
		this._textureCamera.name = 'cop/post';
		this._textureMesh.material = this._textureMaterial;
		this._textureScene.add(this._textureMesh);
		this._textureCamera.position.z = 1;

		// when receiving dirty from children
		this.dirtyController.addPostDirtyHook('reset', () => {
			this.reset();
		});
	}

	override createNode<S extends keyof PostNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): PostNodeChildrenMap[S];
	override createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BasePostProcessNodeType[];
	}
	override nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodesByType(type) as PostNodeChildrenMap[K][];
	}

	override async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.build_effects_composer_if_required();
		this._renderOnTarget(texture);
	}

	build_effects_composer_if_required() {
		if (true) {
			this.build_effects_composer();
		}
	}
	private build_effects_composer() {}

	private async _renderOnTarget(texture: Texture) {
		this._rendererController = this._rendererController || new CopRendererController(this);
		const renderer = await this._rendererController.renderer();

		//
		// prepare
		//
		this._rendererController.saveState();
		this._composerResolution.set(texture.image.width, texture.image.height);
		this._renderTarget =
			this._renderTarget || this._createRenderTarget(this._composerResolution.x, this._composerResolution.y);
		renderer.setRenderTarget(this._renderTarget);
		renderer.setSize(this._composerResolution.x, this._composerResolution.y);

		//
		// render
		//
		// setup composer
		// console.log('this._composer_resolution', this._composer_resolution);
		this._composer = this._composer || this._createComposer(renderer, this._renderTarget);
		this._textureMaterial.uniforms.map.value = texture;
		this._textureMaterial.uniforms.resolution.value = this._composerResolution;

		// renderer.clear();
		// renderer.render(this._texture_scene, this._texture_camera);
		// renderer.autoClear = false;
		this._composer.render();

		if (isBooleanTrue(this.pv.useCameraRenderer)) {
			this.setTexture(this._renderTarget.texture);
		} else {
			const data_texture = this._copy_to_data_texture(renderer, this._renderTarget);
			this.setTexture(data_texture);
		}

		//
		// restore renderer
		//
		this._rendererController.restoreState();
	}

	// renderTarget() {
	// 	return this._renderTarget;
	// }

	private _copy_to_data_texture(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		this._dataTextureController = this._dataTextureController || new DataTextureController(OPTION_SET.data_type);
		const data_texture = this._dataTextureController.from_render_target(renderer, render_target);
		// const data_texture = this._data_texture_controller.from_render_target(renderer, this._composer.writeBuffer);
		// const pixel_count = data_texture.image.data.length / 4;
		// for (let i = 0; i < pixel_count; i++) {
		// 	// data_texture.image.data[i * 4 + 0] = 255;
		// 	// data_texture.image.data[i * 4 + 1] = 125;
		// 	// data_texture.image.data[i * 4 + 2] *= 2;
		// 	// data_texture.image.data[i * 4 + 3] = 255;
		// }
		data_texture.needsUpdate = true;
		// console.log('data_texture', data_texture, data_texture.image.data.slice(0, 30));
		return data_texture;
	}

	private _createRenderTarget(width: number, height: number) {
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			if (image.width == width && image.height == height) {
				return this._renderTarget;
			}
		}

		var renderTarget = new WebGLRenderTarget(width, height, OPTION_SET.params);
		return renderTarget;
	}

	private _createComposer(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		const composer = this.effectsComposerController.createEffectsComposer({
			renderer,
			scene: this._textureScene,
			camera: this._textureCamera,
			resolution: this._composerResolution,
			requester: this,
		});
		composer.renderToScreen = false;
		return composer;
	}

	reset() {
		this._composer = undefined;
	}
}
