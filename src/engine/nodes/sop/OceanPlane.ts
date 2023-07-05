/**
 * Creates a plane with a distorted reflection, to simulate an ocean surface
 *
 * @remarks
 *
 * Without any input, this node creates a very large plane.
 * If you would like the ocean to be restricted to a smaller area, such as a disk,
 * you can plug in an input geometry. Just make sure that this geometry should be facing the z axis,
 * as it will currently be rotated internally to face the y axis. Note that this behavior may change in the future
 * to be made more intuitive.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DEFAULT_PARAMS, DEFAULT_OCEAN_PARAMS} from '../../operations/sop/OceanPlane';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Number3} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {Object3D, Mesh} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {Water, WaterOptions} from '../../../modules/core/objects/Water';
import {replaceChild} from '../../poly/PolyOnObjectsAddedHooksController';
const DEFAULT = DEFAULT_PARAMS;

class OceanPlaneSopParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param reflection direction */
	direction = ParamConfig.VECTOR3(DEFAULT.direction.toArray());
	/** @param sun direction */
	sunDirection = ParamConfig.VECTOR3(DEFAULT.sunDirection.toArray());
	/** @param sun color */
	sunColor = ParamConfig.COLOR(DEFAULT.sunColor.toArray() as Number3);
	/** @param water color */
	waterColor = ParamConfig.COLOR(DEFAULT.waterColor.toArray() as Number3);
	/** @param reflection color */
	reflectionColor = ParamConfig.COLOR(DEFAULT.reflectionColor.toArray() as Number3);
	/** @param reflection fresnel */
	reflectionFresnel = ParamConfig.FLOAT(DEFAULT.reflectionFresnel);
	/** @param waves Height */
	wavesHeight = ParamConfig.FLOAT(DEFAULT.wavesHeight, {
		range: [0, 10],
		rangeLocked: [false, false],
	});
	/** @param distortion scale */
	distortionScale = ParamConfig.FLOAT(DEFAULT.distortionScale, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param distortion speed */
	timeScale = ParamConfig.FLOAT(DEFAULT.timeScale, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param size */
	size = ParamConfig.FLOAT(DEFAULT.size, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	advanced = ParamConfig.FOLDER();
	/** @param render reflection */
	renderReflection = ParamConfig.BOOLEAN(DEFAULT.renderReflection);
	/** @param normal Bias - adjusts this if the reflections are too grainy */
	normalBias = ParamConfig.FLOAT(DEFAULT.normalBias, {
		range: [0, 0.1],
		rangeLocked: [false, false],
	});
	/** @param multisamples */
	multisamples = ParamConfig.INTEGER(DEFAULT.multisamples, {
		range: [0, 4],
		rangeLocked: [true, false],
	});
	/** @param reacts to fog */
	useFog = ParamConfig.BOOLEAN(DEFAULT.useFog);
}
const ParamsConfig = new OceanPlaneSopParamsConfig();

export class OceanPlaneSopNode extends TypedSopNode<OceanPlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'oceanPlane';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.threejsObjectsWithGeo();
		for (const object of objects) {
			Poly.onObjectsAddedHooks.assignHookHandler(object, this);
		}
		this.setCoreGroup(coreGroup);
	}
	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}

		const scene = this.scene();
		const renderer = scene.renderersRegister.lastRegisteredRenderer();

		Water.rotateGeometry(geometry, this.pv.direction);
		const waterOptions: WaterOptions = {
			polyScene: this.scene(),
			scene: scene.threejsScene(),
			renderer,
			...DEFAULT_OCEAN_PARAMS,
			direction: this.pv.direction,
			sunDirection: this.pv.sunDirection,
			sunColor: this.pv.sunColor,
			wavesHeight: this.pv.wavesHeight,
			waterColor: this.pv.waterColor,
			reflectionColor: this.pv.reflectionColor,
			reflectionFresnel: this.pv.reflectionFresnel,
			distortionScale: this.pv.distortionScale,
			timeScale: this.pv.timeScale,
			size: this.pv.size,
			// renderReflection: params.renderReflection,
			normalBias: this.pv.normalBias,
			multisamples: this.pv.multisamples,
			useFog: this.pv.useFog,
		};
		const water = new Water(geometry, waterOptions);
		water.matrixAutoUpdate = false;
		// make sure object attributes are up to date
		object.matrix.decompose(object.position, object.quaternion, object.scale);
		water.position.copy(object.position);
		water.rotation.copy(object.rotation);
		water.scale.copy(object.scale);
		water.updateMatrix();
		Water.compensateGeometryRotation(water, this.pv.direction);
		//

		// water.updateMatrix();
		// water.matrixAutoUpdate = false;
		const material = water.material;
		material.uniforms.direction.value.copy(this.pv.direction);
		material.uniforms.sunDirection.value.copy(this.pv.sunDirection);
		material.uniforms.sunColor.value.copy(this.pv.sunColor);
		material.uniforms.wavesHeight.value = this.pv.wavesHeight;
		material.uniforms.waterColor.value.copy(this.pv.waterColor);
		material.uniforms.reflectionColor.value.copy(this.pv.reflectionColor);
		material.uniforms.reflectionFresnel.value = this.pv.reflectionFresnel;
		material.uniforms.distortionScale.value = this.pv.distortionScale;
		material.uniforms.timeScale.value = this.pv.timeScale;
		material.uniforms.size.value = this.pv.size;
		material.uniforms.normalBias.value = this.pv.normalBias;
		water.setReflectionActive(isBooleanTrue(this.pv.renderReflection));
		replaceChild(parent, object, water);
	}
}
