import {PolyScene} from '../../../PolyScene';
import {ActorsManager} from '../../ActorsManager';
import {Object3D} from 'three';
import {ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT} from '../../../../../core/actor/ActorCompilationController';
import {pushOnArrayAtEntry} from '../../../../../core/MapUtils';
import {EmptyOptions} from './Common';

export class BaseUserInputController {
	protected _scene: PolyScene;
	protected _objects: Object3D[] = [];
	protected _propertiesListByObject: Map<Object3D, EmptyOptions[]> = new Map();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	addPropertiesForObject(object: Object3D, properties: EmptyOptions) {
		if (object == ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT) {
			return;
		}

		pushOnArrayAtEntry(this._propertiesListByObject, object, properties);

		const index = this._objects.indexOf(object);
		if (index < 0) {
			this._objects.push(object);
		}
	}
	removePropertiesForObject(object: Object3D, properties: EmptyOptions) {
		if (object == ACTOR_COMPILATION_CONTROLLER_DUMMY_OBJECT) {
			return;
		}

		const propertiesForObject = this._propertiesListByObject.get(object);
		if (!propertiesForObject) {
			return;
		}
		const propertyIndex = propertiesForObject.indexOf(properties);
		propertiesForObject.splice(propertyIndex, 1);

		if (propertiesForObject.length == 0) {
			const objectIndex = this._objects.indexOf(object);
			if (objectIndex >= 0) {
				this._objects.splice(objectIndex, 1);
				this._propertiesListByObject.delete(object);
			}
		}
	}
}
