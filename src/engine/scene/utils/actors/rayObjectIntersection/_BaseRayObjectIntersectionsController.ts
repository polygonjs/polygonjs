import {ref} from '@vue/reactivity';
import {PolyScene} from '../../../PolyScene';
import {ActorsManager} from '../../ActorsManager';
import {Object3D, Intersection, Vector2, Vector3, Vector4, PerspectiveCamera, OrthographicCamera} from 'three';
import type {RaycasterUpdateOptions} from '../../events/PointerEventsController';
import {ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT} from '../../../../../core/actor/ActorCompilationController';
import {RenderPixelController, coreCursorToUv} from '../../../../../core/render/renderPixel/RenderPixelController';
import {coreGetDefaultCamera} from '../../../../../core/render/renderPixel/CoreGetDefautCamera';
import {pushOnArrayAtEntry} from '../../../../../core/MapUtils';
import {
	CPUOptions,
	ObjectOptions,
	hasCPUOptions,
	hasGPUOptions,
	CPUOptionsEqual,
	CPUOptionsMax,
	GPUOptionsDepthBufferRequired,
} from './Common';

const RAYCAST_UPDATE_OPTIONS: RaycasterUpdateOptions = {
	pointsThreshold: 0.1,
	lineThreshold: 0.1,
};
const TMP_CPU_OPTIONS: CPUOptions = {
	traverseChildren: false,
	pointsThreshold: 0.1,
	lineThreshold: 0.1,
	intersectionRef: ref(null),
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
	protected _propertiesListByObject: Map<Object3D, ObjectOptions[]> = new Map();
	private _intersectsByObject: WeakMap<Object3D, Intersection[]> = new WeakMap();
	private _closestIntersects: Map<Object3D, CPUOrGPUIntersection | undefined> = new Map();
	private _objectByClosestIntersect: Map<CPUOrGPUIntersection, Object3D> = new Map();
	private _closestIntersectsSorted: CPUOrGPUIntersection[] = [];
	private _renderPixelController: RenderPixelController = new RenderPixelController();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}
	protected _setIntersectedState(objects: Object3D[], intersectedStateByObject: WeakMap<Object3D, boolean>) {
		// prepare
		if (objects.length == 0) {
			return;
		}
		this._closestIntersects.clear();
		this._objectByClosestIntersect.clear();

		//
		const pointerEventsController = this._scene.eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster().value;

		pointerEventsController.updateRaycast(RAYCAST_UPDATE_OPTIONS);

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
			intersectedStateByObject.set(object, false /*we reset to false here*/);
			const propertiesList = this._propertiesListByObject.get(object);
			const intersects = this._intersectsByObject.get(object);
			if (propertiesList && intersects) {
				intersects.length = 0;
				if (hasCPUOptions(propertiesList)) {
					const cpuOptions = CPUOptionsEqual(propertiesList)
						? propertiesList[0].cpu!
						: CPUOptionsMax(propertiesList, TMP_CPU_OPTIONS);
					RAYCAST_UPDATE_OPTIONS.pointsThreshold = cpuOptions.pointsThreshold;
					RAYCAST_UPDATE_OPTIONS.lineThreshold = cpuOptions.lineThreshold;
					raycaster.intersectObject(object, cpuOptions.traverseChildren, intersects);
					const closestIntersect = intersects[0];
					this._closestIntersects.set(object, closestIntersect);
					if (closestIntersect) {
						this._objectByClosestIntersect.set(closestIntersect, object);
						// console.log({object: object.name, distance: closestIntersect.distance});
					}
				}
				if (hasGPUOptions(propertiesList)) {
					const gpuOptions = propertiesList[0].gpu;
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
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				for (const properties of propertiesList) {
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
		}
		this._closestIntersectsSorted.sort(intersectsSort);

		// process objects in order
		let blockingObjectProcessed = false;
		for (const intersect of this._closestIntersectsSorted) {
			const object = this._objectByClosestIntersect.get(intersect);
			if (object) {
				const propertiesList = this._propertiesListByObject.get(object);
				if (propertiesList) {
					let blockObjectsBehind = false;
					for (const properties of propertiesList) {
						if (blockingObjectProcessed == false || properties.priority.skipIfObjectsInFront == true) {
							intersectedStateByObject.set(object, true);
						}

						if (properties.priority.blockObjectsBehind == true) {
							blockObjectsBehind = true;
						}
					}
					blockingObjectProcessed = blockObjectsBehind;
				}
			}
		}

		// reset
		this._objectByClosestIntersect.clear();
	}
	// protected _postProcess() {
	// 	this._objectByClosestIntersect.clear();
	// }
	private _gpuObjectsPresent(): boolean {
		const objects = this._objects;
		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList && hasGPUOptions(propertiesList)) {
				return true;
			}
		}
		return false;
	}
	private _gpuDepthBufferReadRequired(): boolean {
		const objects = this._objects;
		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList && GPUOptionsDepthBufferRequired(propertiesList)) {
				return true;
			}
		}
		return false;
	}

	addPropertiesForObject(object: Object3D, properties: ObjectOptions) {
		if (object == ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT) {
			return;
		}
		pushOnArrayAtEntry(this._propertiesListByObject, object, properties);

		const index = this._objects.indexOf(object);
		if (index < 0) {
			this._objects.push(object);
			this._intersectsByObject.set(object, []);
		}
	}
	removePropertiesForObject(object: Object3D, properties: ObjectOptions) {
		if (object == ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT) {
			return;
		}

		const propertiesForObject = this._propertiesListByObject.get(object);
		if (propertiesForObject) {
			const propertyIndex = propertiesForObject.indexOf(properties);
			propertiesForObject.splice(propertyIndex, 1);

			if (propertiesForObject.length == 0) {
				const objectIndex = this._objects.indexOf(object);
				if (objectIndex >= 0) {
					this._objects.splice(objectIndex, 1);
					this._intersectsByObject.delete(object);
					this._propertiesListByObject.delete(object);
				}
			}
		}
	}
}
