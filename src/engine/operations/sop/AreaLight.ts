import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {RectAreaLightUniformsLib} from '../../../modules/three/examples/jsm/lights/RectAreaLightUniformsLib';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Group, RectAreaLight} from 'three';
import {AreaLightParams, CoreRectAreaLightHelper, DEFAULT_AREA_LIGHT_PARAMS} from '../../../core/lights/AreaLight';
import {CoreSceneObjectsFactory} from '../../../core/CoreSceneObjectsFactory';

export class AreaLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AreaLightParams = DEFAULT_AREA_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'areaLight'> {
		return 'areaLight';
	}
	override cook(inputCoreGroups: CoreGroup[], params: AreaLightParams) {
		const light = this.createLight();
		light.name = params.name;

		this.updateLightParams(light, params);

		if (isBooleanTrue(params.showHelper)) {
			const group = new Group();
			group.matrixAutoUpdate = false;
			group.add(light);
			const helper = this._createHelper(light);
			if (helper) {
				group.add(helper);
			}
			group.name = `AreaLightGroup_${light.name}`;

			return this.createCoreGroupFromObjects([group]);
		} else {
			return this.createCoreGroupFromObjects([light]);
		}
	}

	createLight() {
		const light = CoreSceneObjectsFactory.generators.areaLight(0xffffff, 1, 1, 1);
		light.matrixAutoUpdate = false;
		const nodeName = this._node?.name();
		if (nodeName) {
			light.name = `AreaLight_${nodeName}`;
		}

		if (!(RectAreaLightUniformsLib as any).initialized) {
			RectAreaLightUniformsLib.init();
			(RectAreaLightUniformsLib as any).initialized = true;
		}

		return light;
	}
	updateLightParams(light: RectAreaLight, params: AreaLightParams) {
		light.color = params.color;
		light.intensity = params.intensity;
		light.width = params.width;
		light.height = params.height;

		// this._helperController.update();
	}

	private _createHelper(light: RectAreaLight) {
		const nodeName = this._node?.name();
		if (nodeName) {
			const helper = new CoreRectAreaLightHelper(light, nodeName);
			helper.update();
			return helper;
		}
	}
}
