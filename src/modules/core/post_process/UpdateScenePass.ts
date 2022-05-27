import {WebGLRenderTarget} from 'three';
import {Pass} from 'postprocessing';
import {WebGLRenderer} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {Object3D} from 'three';
import {Mesh} from 'three';
import {Material} from 'three';
import {MeshBasicMaterial} from 'three';
import {Color} from 'three';

const MATTE_MATERIAL = new MeshBasicMaterial({color: new Color(0, 0, 0)});

interface UpdateScenePassOptions {
	scene: PolyScene;
	reset: boolean;
	passToReset?: UpdateScenePass;
	objectsMask: string;
	invertMask: boolean;
	setMatteMaterial: boolean;
	setVisible: boolean;
	visible: boolean;
}

export class UpdateScenePass extends Pass {
	public override needsSwap = false;
	public updatesRender = false;
	private _scene: PolyScene;
	public reset: boolean;
	public passToReset?: UpdateScenePass;
	public objectsMask: string;
	public invertMask: boolean;
	public setMatteMaterial: boolean;
	public setVisible: boolean;
	public visible: boolean;
	constructor(options: UpdateScenePassOptions) {
		super();
		this._scene = options.scene;
		this.reset = options.reset;
		this.passToReset = options.passToReset;
		this.objectsMask = options.objectsMask;
		this.invertMask = options.invertMask;
		this.setMatteMaterial = options.setMatteMaterial;
		this.setVisible = options.setVisible;
		this.visible = options.visible;
	}

	private _objectsList: Object3D[] = [];
	objectsList() {
		return this._objectsList;
	}
	private _materialByMesh: Map<Mesh, Material | Material[]> = new Map();
	private _visibleByObject: Map<Object3D, boolean> = new Map();

	override render(
		renderer: WebGLRenderer,
		writeBuffer: WebGLRenderTarget,
		readBuffer: WebGLRenderTarget,
		deltaTime: number,
		maskActive: boolean
	) {
		if (isBooleanTrue(this.reset)) {
			if (this.passToReset) {
				this.passToReset.resetChanges();
			} else {
				console.warn('reset is true, but no passToReset is given');
			}
		} else {
			const changeNeeded = isBooleanTrue(this.setMatteMaterial) || isBooleanTrue(this.setVisible);
			if (changeNeeded) {
				this._objectsList.length = 0;
				const mask = this.objectsMask;
				this._scene.objectsController.traverseObjectsWithMask(mask, this._updateObjectBound, this.invertMask);
			}
		}
	}
	private _updateObjectBound = this._updateObject.bind(this);
	private _updateObject(obj: Object3D) {
		this._objectsList.push(obj);
		if (isBooleanTrue(this.setMatteMaterial)) {
			const mesh = obj as Mesh;
			if (mesh.material) {
				this._materialByMesh.set(mesh, mesh.material);
				mesh.material = MATTE_MATERIAL;
			}
		}
		if (isBooleanTrue(this.setVisible)) {
			if (obj.visible != this.visible) {
				this._visibleByObject.set(obj, obj.visible);
				obj.visible = this.visible;
			}
		}
	}
	resetChanges() {
		// reset mat
		this._materialByMesh.forEach((mat, mesh) => {
			mesh.material = mat;
		});
		this._materialByMesh.clear();
		// reset visibility
		this._visibleByObject.forEach((visible, obj) => {
			obj.visible = visible;
		});
		this._visibleByObject.clear();
	}
}
