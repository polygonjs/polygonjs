import {CopyPass} from 'postprocessing';
import {WebGLRenderer, WebGLRenderTarget} from 'three';
import {isBooleanTrue} from '../../../../../core/Type';
// import FRAGMENT from '../../gl/passThrough.glsl';
import {UpdateScenePostNode} from '../../UpdateScene';

interface UpdateSceneEffectOptions {
	// scene: PolyScene;
	reset: boolean;
	node: UpdateScenePostNode;
	nodeToReset?: UpdateScenePostNode;
	// objectsMask: string;
	// invertMask: boolean;
	// setMatteMaterial: boolean;
	// setVisible: boolean;
	// visible: boolean;
}

export class UpdateScenePass extends CopyPass {
	// public override needsSwap = false;
	// public updatesRender = false;
	// private _scene: PolyScene;
	public reset: boolean;
	public node: UpdateScenePostNode;
	public nodeToReset?: UpdateScenePostNode;
	// public objectsMask: string;
	// public invertMask: boolean;
	// public setMatteMaterial: boolean;
	// public setVisible: boolean;
	// public visible: boolean;
	constructor(options: UpdateSceneEffectOptions) {
		// const applyChanges = () => options.node.applyChanges();
		// const resetChanges = () => {
		// 	if (options.nodeToReset) {
		// 		options.nodeToReset.applyChanges();
		// 	} else {
		// 		console.warn('reset is true, but no passToReset is given', options.node);
		// 	}
		// };
		// const f = isBooleanTrue(options.reset) ? resetChanges : applyChanges;
		super();
		// this._scene = options.scene;
		this.reset = options.reset;
		this.node = options.node;
		this.nodeToReset = options.nodeToReset;
		// this.objectsMask = options.objectsMask;
		// this.invertMask = options.invertMask;
		// this.setMatteMaterial = options.setMatteMaterial;
		// this.setVisible = options.setVisible;
		// this.visible = options.visible;
	}
	// private _onRenderBound = this._onRender.bind(this)
	// private _onRender(){

	// }
	override render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		outputBuffer: WebGLRenderTarget,
		deltaTime?: number,
		stencilTest?: boolean
	) {
		if (isBooleanTrue(this.reset)) {
			if (this.nodeToReset) {
				this.nodeToReset.resetChanges();
			} else {
				console.warn('reset is true, but no passToReset is given');
			}
		} else {
			this.node.applyChanges();
		}
		// console.warn(deltaTime, this);
		super.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
	}

	// override update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime: number) {
	// 	if (isBooleanTrue(this.reset)) {
	// 		if (this.nodeToReset) {
	// 			this.nodeToReset.resetChanges();
	// 		} else {
	// 			console.warn('reset is true, but no passToReset is given');
	// 		}
	// 	} else {
	// 		this.node.applyChanges();
	// 	}
	// 	// console.warn(deltaTime, this);
	// 	super.update(renderer, inputBuffer, deltaTime);
	// }
	// private _updateObjectBound = this._updateObject.bind(this);
	// private _updateObject(obj: Object3D) {
	// 	this._objectsList.push(obj);
	// 	if (isBooleanTrue(this.setMatteMaterial)) {
	// 		const mesh = obj as Mesh;
	// 		if (mesh.material) {
	// 			this._materialByMesh.set(mesh, mesh.material);
	// 			mesh.material = MATTE_MATERIAL;
	// 		}
	// 	}
	// 	if (isBooleanTrue(this.setVisible)) {
	// 		if (obj.visible != this.visible) {
	// 			this._visibleByObject.set(obj, obj.visible);
	// 			obj.visible = this.visible;
	// 			console.log(obj, obj.visible);
	// 		}
	// 	}
	// }
}
