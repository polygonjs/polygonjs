import {LightUserDataRaymarching} from './../../../core/lights/Common';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Group, PointLight} from 'three';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CorePointLightHelper, PointLightParams, DEFAULT_POINT_LIGHT_PARAMS} from '../../../core/lights/PointLight';
import {ObjectType, registerObjectType} from '../../../core/geometry/Constant';
// import {Mesh, PlaneGeometry, MeshBasicMaterial, Color, DoubleSide} from 'three';
export class PointLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PointLightParams = DEFAULT_POINT_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'pointLight'> {
		return 'pointLight';
	}
	override cook(input_contents: CoreGroup[], params: PointLightParams) {
		const light = this.createLight();
		light.name = params.name;

		this.updateLightParams(light, params);
		this.updateShadowParams(light, params);

		if (isBooleanTrue(params.showHelper)) {
			const group = new Group();
			group.name = `PointLightGroup_${light.name}`;
			group.add(light);
			const helper = this._createHelper(light, params);
			if (helper) {
				group.add(helper);
				helper.name = `PointLightHelper_${light.name}`;
			}
			return this.createCoreGroupFromObjects([group]);
		} else {
			return this.createCoreGroupFromObjects([light]);
		}
	}

	private _helper: CorePointLightHelper | undefined;
	private _createHelper(light: PointLight, params: PointLightParams) {
		this._helper = this._helper || new CorePointLightHelper();
		return this._helper.createAndBuildObject({helperSize: params.helperSize, light});
	}

	createLight() {
		registerObjectType({
			type: ObjectType.POINT_LIGHT,
			checkFunc: (obj) => {
				if ((obj as PointLight as any).isPointLight) {
					return ObjectType.POINT_LIGHT;
				}
			},
			ctor: PointLight,
			humanName: 'PointLight',
		});
		const light = new PointLight();
		const nodeName = this._node?.name();
		if (nodeName) {
			light.name = `PointLight_${nodeName}`;
		}

		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		return light;
	}
	updateLightParams(light: PointLight, params: PointLightParams) {
		light.color = params.color;
		light.intensity = params.intensity;
		light.decay = params.decay;
		light.distance = params.distance;

		light.userData[LightUserDataRaymarching.PENUMBRA] = params.raymarchingPenumbra;
		light.userData[LightUserDataRaymarching.SHADOW_BIAS_ANGLE] = params.raymarchingShadowBiasAngle;
		light.userData[LightUserDataRaymarching.SHADOW_BIAS_DISTANCE] = params.raymarchingShadowBiasDistance;
	}
	updateShadowParams(light: PointLight, params: PointLightParams) {
		light.castShadow = isBooleanTrue(params.castShadow);
		light.shadow.autoUpdate = isBooleanTrue(params.shadowAutoUpdate);
		light.shadow.needsUpdate = light.shadow.autoUpdate || isBooleanTrue(params.shadowUpdateOnNextRender);

		light.shadow.mapSize.copy(params.shadowRes);
		// const map = light.shadow.map;
		// if (map) {
		// 	if (isBooleanTrue(params.debugShadow)) {
		// 		light.add(this._debugShadowMesh(light));
		// 	} else {
		// 		if (this.__debugShadowMesh) {
		// 			light.remove(this.__debugShadowMesh);
		// 		}
		// 	}
		// }

		light.shadow.camera.near = params.shadowNear;
		light.shadow.camera.far = params.shadowFar;
		light.shadow.bias = params.shadowBias;

		light.shadow.camera.updateProjectionMatrix();
	}
	// private __debugShadowMesh: Mesh<PlaneGeometry, MeshBasicMaterial> | undefined;
	// private _debugShadowMesh(light: PointLight) {
	// 	return (this.__debugShadowMesh = this.__debugShadowMesh || this._createDebugShadowMesh(light));
	// }
	// private _createDebugShadowMesh(light: PointLight) {
	// 	const material = new MeshBasicMaterial({
	// 		color: new Color(1, 1, 1),
	// 		map: light.shadow.map.texture,
	// 		side: DoubleSide,
	// 	});
	// 	const mesh = new Mesh(new PlaneGeometry(5, 5, 2, 2), material);
	// 	mesh.position.z = 1;
	// 	mesh.castShadow = false;
	// 	mesh.receiveShadow = false;
	// 	return mesh;
	// }
}
