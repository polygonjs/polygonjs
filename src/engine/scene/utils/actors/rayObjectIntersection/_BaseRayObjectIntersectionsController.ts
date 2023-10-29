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
	// currently using a worldPosMaterial, as it seems more precise than using the depth buffer
	worldPosMaterial: Material;
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
// const raycasterDirNormalised = new Vector3();
// const gpuCameraRayAtNearPlane = new Vector3();
// const gpuCameraRayAtFarPlane = new Vector3();
const gpuHitPos = new Vector3();

interface GPUIntersection {
	distance: number;
}
type CPUOrGPUIntersection = Intersection | GPUIntersection;

// function remapDepthToDistance(pixelValue: number, near: number, far: number) {
// 	// from src/renderers/shaders/ShaderChunk/packing.glsl.js
// 	// const viewZ = (near * far) / ((far - near) * pixelValue - far);
// 	// const result = (viewZ + near) / (near - far);
// 	// console.log({pixelValue, viewZ, result});
// 	// return result;
// 	// const delta = far - near;
// 	return near + (1 - pixelValue) * (far - near);
// }

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
		const gpuObjects = this._gpuObjectsPresent();
		const camera =
			gpuObjects == true ? (coreGetDefaultCamera(this._scene) as PerspectiveCamera | OrthographicCamera) : null;
		if (gpuObjects == true && camera) {
			coreCursorToUv(pointerEventsController.cursor().value, pixelRenderUv);
			// console.log(camera.position.toArray(), raycaster.ray.origin.toArray(), raycaster.ray.direction.toArray());
			// raycasterDirNormalised.copy(raycaster.ray.direction).normalize();
			// gpuCameraRayAtNearPlane.copy(raycasterDirNormalised).multiplyScalar(camera.near).add(raycaster.ray.origin);
			// gpuCameraRayAtFarPlane.copy(raycasterDirNormalised).multiplyScalar(camera.far).add(raycaster.ray.origin);
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
						this._renderPixelController.renderColor(
							this._scene,
							object,
							gpuOptions.worldPosMaterial,
							camera,
							null, //necessary to have alpha=0 when no object is hit
							pixelRenderUv,
							pixelRenderTarget
						);
						if (pixelRenderTarget.w > 0 /* pixelRenderTarget.w >= gpuOptions.alphaTest*/) {
							// const NDCDistance = remapDepthToDistance(pixelRenderTarget.x, camera.near, camera.far);
							// const lerp = remapDepthToDistance(pixelRenderTarget.x, camera.near, camera.far);
							// gpuHitPos.copy(gpuCameraRayAtNearPlane).lerp(gpuCameraRayAtFarPlane, pixelRenderTarget.x);
							gpuHitPos.set(pixelRenderTarget.x, pixelRenderTarget.y, pixelRenderTarget.z);
							const distance = gpuHitPos.distanceTo(raycaster.ray.origin);
							// const distance = pixelRenderTarget.x * (camera.far - camera.near) + camera.near;
							const gpuIntersect: GPUIntersection = {distance};
							// console.log({object: object.name, x: pixelRenderTarget.x, distance});
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

		// commit new hovered state
		// for (const object of objects) {
		// 	const properties = this._propertiesByObject.get(object);
		// 	if (properties) {
		// 		const currentHoveredState = properties.hoveredStateRef.value;
		// 		const newHoveredState = this._intersectedStateByObject.get(object) || false;
		// 		if (newHoveredState != currentHoveredState) {
		// 			properties.hoveredStateRef.value = newHoveredState;
		// 			properties.onHoveredStateChange();
		// 		}
		// 	}
		// }

		// reset
		// this._postProcess();
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
