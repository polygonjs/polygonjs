import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {Pass} from 'three/examples/jsm/postprocessing/Pass.js';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {isBooleanTrue} from '../../../core/Type';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {Color} from 'three/src/math/Color';

const BLACK_MATERIAL = new MeshBasicMaterial({color: new Color(0, 0, 0)});

interface UpdateScenePassOptions {
	scene: PolyScene;
	reset: boolean;
	passToReset?: UpdateScenePass;
	objectsMask: string;
	invertMask: boolean;
	setBlackMaterial: boolean;
}

export class UpdateScenePass extends Pass {
	public needsSwap = false;
	public updatesRender = false;
	private _scene: PolyScene;
	public reset: boolean;
	public passToReset?: UpdateScenePass;
	public setBlackMaterial: boolean;
	public objectsMask: string;
	public invertMask: boolean;
	constructor(options: UpdateScenePassOptions) {
		super();
		this._scene = options.scene;
		this.reset = options.reset;
		this.passToReset = options.passToReset;
		this.setBlackMaterial = options.setBlackMaterial;
		this.objectsMask = options.objectsMask;
		this.invertMask = options.invertMask;
	}

	private _meshesList: Mesh[] = [];
	meshesList() {
		return this._meshesList;
	}
	private _materialByMesh: Map<Mesh, Material | Material[]> = new Map();

	render(
		renderer: WebGLRenderer,
		writeBuffer: WebGLRenderTarget,
		readBuffer: WebGLRenderTarget,
		deltaTime: number,
		maskActive: boolean
	) {
		if (isBooleanTrue(this.reset)) {
			if (this.passToReset) {
				this.passToReset.resetMat();
			} else {
				console.warn('reset is true, but no passToReset is given');
			}
		} else {
			if (isBooleanTrue(this.setBlackMaterial)) {
				this._meshesList.length = 0;
				const mask = this.objectsMask;
				this._scene.objectsController.traverseObjectsWithMask(mask, this._updateObjectBound, this.invertMask);
			}
		}
	}
	private _updateObjectBound = this._updateObject.bind(this);
	private _updateObject(obj: Object3D) {
		const mesh = obj as Mesh;
		// make sure the current material is not BLACK_MATERIAL
		// as this would be the case when setting up this node, before its reset counterpart is added to the effectcomposer pipeline
		if (mesh.material && mesh.material !== BLACK_MATERIAL) {
			this._meshesList.push(mesh);
			this._materialByMesh.set(mesh, mesh.material);
			mesh.material = BLACK_MATERIAL;
		}
	}
	resetMat() {
		this._materialByMesh.forEach((mat, mesh) => {
			mesh.material = mat;
		});
		this._materialByMesh.clear();
	}
}
