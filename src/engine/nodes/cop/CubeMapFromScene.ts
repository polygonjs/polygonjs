/**
 * generates a cube map from a scene
 *
 *
 */

import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {BaseGlNodeType} from '../gl/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {BaseNodeType} from '../_Base';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {PMREMGenerator, Scene, Texture, WebGLRenderer, WebGLRenderTarget} from 'three';
import {BaseSopNodeType} from '../sop/_Base';
import {CopRendererController} from './utils/RendererController';

function CubeMapFromSceneCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param force Render */
		blur = ParamConfig.FLOAT(0, {
			range: [0, 0.1],
			step: 0.0001,
			rangeLocked: [true, false],
		});
		/** @param camera near */
		near = ParamConfig.FLOAT(0.1, {
			range: [0.0001, 1],
			step: 0.0001,
			rangeLocked: [true, false],
		});
		/** @param camera far */
		far = ParamConfig.FLOAT(100, {
			range: [0, 100],
			rangeLocked: [true, false],
		});
		/** @param force Render */
		render = ParamConfig.BUTTON(null, {
			callback: async (node: BaseNodeType) => {
				await CubeMapFromSceneCopNode.PARAM_CALLBACK_render(node as CubeMapFromSceneCopNode);
			},
		});
	};
}
class CubeMapFromSceneCopParamsConfig extends CubeMapFromSceneCopParamConfig(NodeParamsConfig) {}

const ParamsConfig = new CubeMapFromSceneCopParamsConfig();

export class CubeMapFromSceneCopNode extends TypedCopNode<CubeMapFromSceneCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.CUBE_MAP_FROM_SCENE;
	}
	private _rendererController: CopRendererController | undefined;
	private _lastGeneratedRenderTarget: WebGLRenderTarget | undefined;
	lastGeneratedRenderTarget() {
		return this._lastGeneratedRenderTarget;
	}

	// display_node and children_display controllers
	// private _renderCubeMapBound = this._renderCubeMap.bind(this);
	private _setDirtyBound = this._setDirty.bind(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(this, {
		onDisplayNodeRemove: this._setDirtyBound,
		onDisplayNodeSet: this._setDirtyBound,
		onDisplayNodeUpdate: this._setDirtyBound,
	});
	//

	protected override _childrenControllerContext = NodeContext.SOP;
	override initializeNode() {
		this.addPostDirtyHook('_cook_main_without_inputs_when_dirty', () => {
			setTimeout(this._cookMainWithoutInputsWhenDirtyBound, 0);
		});
	}

	override createNode<S extends keyof GeoNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GeoNodeChildrenMap[S];
	override createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodesByType(type) as GeoNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		return true;
	}

	private _setDirty() {
		this.setDirty();
	}
	private _cookMainWithoutInputsWhenDirtyBound = this._cookMainWithoutInputsWhenDirty.bind(this);
	private async _cookMainWithoutInputsWhenDirty() {
		await this.cookController.cookMainWithoutInputs();
	}

	override async cook() {
		const texture = await this._renderCubeMap();
		if (!texture) {
			this.cookController.endCook();
		}
	}

	private _renderScene = new Scene();
	private async _renderCubeMap(): Promise<Texture | undefined> {
		if (!this.scene().loadingController.autoUpdating()) {
			return;
		}

		this._rendererController = this._rendererController || new CopRendererController(this);
		const displayNode = this.displayNodeController.displayNode();
		if (!displayNode) {
			return;
		}
		if (displayNode.context() != NodeContext.SOP) {
			return;
		}
		const sopNode = displayNode as BaseSopNodeType;
		const container = await sopNode.compute();
		if (!container) {
			return;
		}
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			return;
		}

		const renderer = await this._rendererController.waitForRenderer();

		if (!renderer) {
			this.states.error.set('no renderer found to convert the texture to an env map');
			return;
		}
		if (!(renderer instanceof WebGLRenderer)) {
			this.states.error.set('found renderer is not a WebGLRenderer');
			return;
		}

		const currentChildren = [...this._renderScene.children];
		for (const child of currentChildren) {
			this._renderScene.remove(child);
		}
		const objects = coreGroup.threejsObjects();
		for (const object of objects) {
			this._renderScene.add(object);
		}
		const pmremGenerator = new PMREMGenerator(renderer);
		this._lastGeneratedRenderTarget = pmremGenerator.fromScene(
			this._renderScene,
			this.pv.blur,
			this.pv.near,
			this.pv.far
		);
		pmremGenerator.dispose();
		this.setTexture(this._lastGeneratedRenderTarget.texture);
		return this._lastGeneratedRenderTarget.texture;
	}

	/*
	 *
	 * CALLBACK
	 *
	 */
	static async PARAM_CALLBACK_render(node: CubeMapFromSceneCopNode) {
		await node._renderCubeMap();
	}
}
