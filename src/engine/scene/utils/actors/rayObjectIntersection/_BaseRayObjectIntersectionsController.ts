import type {Ref} from '@vue/reactivity';
import {PolyScene} from '../../../PolyScene';
import {ActorsManager} from '../../ActorsManager';
import {
	Object3D,
	Intersection,
	Material,
	Vector2,
	Vector3,
	Vector4,
	PerspectiveCamera,
	OrthographicCamera,
} from 'three';
import type {RaycasterUpdateOptions} from '../../events/PointerEventsController';
import {ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT} from '../../../../../core/actor/ActorCompilationController';
import {RenderPixelController, coreCursorToUv} from '../../../../../core/render/renderPixel/RenderPixelController';
import {coreGetDefaultCamera} from '../../../../../core/render/renderPixel/CoreGetDefautCamera';

export interface PriorityOptions {
	blockObjectsBehind: boolean;
	skipIfObjectsInFront: boolean;
}
export interface CPUOptions {
	traverseChildren: boolean;
	pointsThreshold: number;
	lineThreshold: number;
	intersectionRef: Ref<Intersection | null>;
}
export interface GPUOptions {
	// if a worldPosMaterial is given, we use it and only need a single render call.
	// if not, we render need 2 renders, 1 to write to the depth buffer and another to read it (in addition to readRenderTargetPixels)
	worldPosMaterial: Material | null;
	distanceRef: Ref<number>;
}
export interface AddObjectOptions {
	priority: PriorityOptions;
	cpu?: CPUOptions;
	gpu?: GPUOptions;
}

const RAYCAST_UPDATE_OPTIONS: RaycasterUpdateOptions = {
	pointsThreshold: 0.1,
	lineThreshold: 0.1,
};

function intersectsSort(a: CPUOrGPUIntersection, b: CPUOrGPUIntersection) {
	return a.distance - b.distance;
}
const pixelRenderUv = new Vector2();
const pixelRenderTarget = new Vector4();
const raycasterDirNormalised = new Vector3();
const gpuCameraRayAtNearPlane = new Vector3();
const gpuCameraRayAtFarPlane = new Vector3();
const gpuHitPos = new Vector3();

interface GPUIntersection {
	distance: number;
}
type CPUOrGPUIntersection = Intersection | GPUIntersection;

export class BaseRayObjectIntersectionsController {
	protected _scene: PolyScene;
	protected _objects: Object3D[] = [];
	protected _propertiesByObject: WeakMap<Object3D, AddObjectOptions> = new WeakMap();
	protected _intersectsByObject: WeakMap<Object3D, Intersection[]> = new WeakMap();
	protected _closestIntersects: Map<Object3D, CPUOrGPUIntersection | undefined> = new Map();
	protected _objectByClosestIntersect: Map<CPUOrGPUIntersection, Object3D> = new Map();
	protected _closestIntersectsSorted: CPUOrGPUIntersection[] = [];
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();
	private _renderPixelController: RenderPixelController = new RenderPixelController();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}
	protected _preProcess() {
		// prepare
		this._closestIntersects.clear();
		this._objectByClosestIntersect.clear();

		//
		const pointerEventsController = this._scene.eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster().value;

		pointerEventsController.updateRaycast(RAYCAST_UPDATE_OPTIONS);
		const objects = this._objects;

		// prepare gpu options
		const gpuObjectsPresent = this._gpuObjectsPresent();
		const camera =
			gpuObjectsPresent == true
				? (coreGetDefaultCamera(this._scene) as PerspectiveCamera | OrthographicCamera)
				: null;
		if (gpuObjectsPresent == true && camera) {
			const cursor = pointerEventsController.cursor().value;
			coreCursorToUv(cursor, pixelRenderUv);

			if (this._gpuDepthBufferReadRequired()) {
				raycasterDirNormalised.copy(raycaster.ray.direction).normalize();
				gpuCameraRayAtNearPlane.set(cursor.x, cursor.y, -1).unproject(camera);
				gpuCameraRayAtFarPlane.set(cursor.x, cursor.y, 1).unproject(camera);
			}
		}

		// get intersects
		for (const object of objects) {
			const properties = this._propertiesByObject.get(object);
			const intersects = this._intersectsByObject.get(object);
			if (properties && intersects) {
				intersects.length = 0;
				this._intersectedStateByObject.set(object, false /*we reset to false here*/);
				const cpuOptions = properties.cpu;
				if (cpuOptions) {
					RAYCAST_UPDATE_OPTIONS.pointsThreshold = cpuOptions.pointsThreshold;
					RAYCAST_UPDATE_OPTIONS.lineThreshold = cpuOptions.lineThreshold;
					raycaster.intersectObject(object, cpuOptions.traverseChildren, intersects);
					const closestIntersect = intersects[0];
					this._closestIntersects.set(object, closestIntersect);
					if (closestIntersect) {
						this._objectByClosestIntersect.set(closestIntersect, object);
						// console.log({object: object.name, distance: closestIntersect.distance});
					}
				} else {
					const gpuOptions = properties.gpu;
					if (gpuOptions && camera) {
						const worldPosMaterial = gpuOptions.worldPosMaterial;
						if (worldPosMaterial != null) {
							this._renderPixelController.renderColor(
								this._scene,
								object,
								gpuOptions.worldPosMaterial,
								camera,
								null, //necessary to have alpha=0 when no object is hit
								pixelRenderUv,
								pixelRenderTarget
							);
						} else {
							this._renderPixelController.renderDepth(
								this._scene,
								object,
								// gpuOptions.worldPosMaterial,
								camera,
								null, //necessary to have alpha=0 when no object is hit
								pixelRenderUv,
								pixelRenderTarget
							);
						}
						if (pixelRenderTarget.w > 0 /* pixelRenderTarget.w >= gpuOptions.alphaTest*/) {
							if (worldPosMaterial) {
								gpuHitPos.set(pixelRenderTarget.x, pixelRenderTarget.y, pixelRenderTarget.z);
							} else {
								gpuHitPos
									.copy(gpuCameraRayAtNearPlane)
									.lerp(gpuCameraRayAtFarPlane, pixelRenderTarget.x);
							}
							const distance = gpuHitPos.distanceTo(raycaster.ray.origin);
							const gpuIntersect: GPUIntersection = {distance};

							this._closestIntersects.set(object, gpuIntersect);
							if (gpuIntersect) {
								this._objectByClosestIntersect.set(gpuIntersect, object);
							}
						} else {
							this._closestIntersects.set(object, undefined);
						}
					}
				}
			}
		}
		// sort closest intersects
		this._closestIntersectsSorted.length = 0;
		for (const object of objects) {
			const closestIntersect = this._closestIntersects.get(object);
			if (closestIntersect) {
				this._closestIntersectsSorted.push(closestIntersect);
			}
			const properties = this._propertiesByObject.get(object);
			if (properties) {
				const cpuOptions = properties.cpu;
				if (cpuOptions) {
					cpuOptions.intersectionRef.value = (closestIntersect as Intersection) || null;
				} else {
					const gpuOptions = properties.gpu;
					if (gpuOptions) {
						gpuOptions.distanceRef.value = closestIntersect ? closestIntersect.distance : -1;
					}
				}
			}
		}
		this._closestIntersectsSorted.sort(intersectsSort);

		// process objects in order
		let blockingObjectProcessed = false;
		for (const intersect of this._closestIntersectsSorted) {
			const object = this._objectByClosestIntersect.get(intersect);
			if (object) {
				const properties = this._propertiesByObject.get(object);
				if (properties) {
					if (blockingObjectProcessed == false || properties.priority.skipIfObjectsInFront == true) {
						this._intersectedStateByObject.set(object, true);
					}

					if (properties.priority.blockObjectsBehind == true) {
						blockingObjectProcessed = true;
					}
				}
			}
		}
	}
	protected _postProcess() {
		this._objectByClosestIntersect.clear();
	}
	private _gpuObjectsPresent(): boolean {
		const objects = this._objects;
		for (const object of objects) {
			const properties = this._propertiesByObject.get(object);
			if (properties && properties.gpu) {
				return true;
			}
		}
		return false;
	}
	private _gpuDepthBufferReadRequired(): boolean {
		const objects = this._objects;
		for (const object of objects) {
			const properties = this._propertiesByObject.get(object);
			if (properties && properties.gpu && properties.gpu.worldPosMaterial == null) {
				return true;
			}
		}
		return false;
	}

	addObject(object: Object3D, properties: AddObjectOptions) {
		if (object == ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT) {
			return;
		}
		this._objects.push(object);
		this._propertiesByObject.set(object, properties);
		this._intersectsByObject.set(object, []);
	}
	removeObject(object: Object3D) {
		const index = this._objects.indexOf(object);
		if (index >= 0) {
			this._objects.splice(index, 1);
		}
		this._propertiesByObject.delete(object);
		this._intersectsByObject.delete(object);
		this._intersectedStateByObject.delete(object);
	}
}
