/**
 * Uses a flat mesh and renders a mirror on it.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DEFAULT_PARAMS} from '../../operations/sop/Reflector';
import {Reflector} from '../../../modules/core/objects/Reflector';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Number3} from '../../../types/GlobalTypes';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Poly} from '../../Poly';
import {Object3D, Vector3, Mesh} from 'three';
import {replaceChild} from '../../poly/PolyOnObjectsAddRemoveHooksController';
const DEFAULT = DEFAULT_PARAMS;

const _v3 = new Vector3();
class ReflectorSopParamsConfig extends NodeParamsConfig {
	/** @param direction the objects reflects */
	direction = ParamConfig.VECTOR3(DEFAULT.direction.toArray());
	/** @param direction offset */
	directionOffset = ParamConfig.FLOAT(DEFAULT.directionOffset, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param when active is off, the mirror is not rendered */
	active = ParamConfig.BOOLEAN(DEFAULT.active);
	/** @param bias to ensure the mirror does not reflect itself */
	clipBias = ParamConfig.FLOAT(DEFAULT.clipBias);
	/** @param color */
	color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3);
	/** @param useVertexColor */
	useVertexColor = ParamConfig.BOOLEAN(DEFAULT.useVertexColor);
	/** @param reflectionBlend */
	reflectionBlend = ParamConfig.FLOAT(DEFAULT.reflectionBlend);
	/** @param pixelRatio */
	/** @param opacity */
	opacity = ParamConfig.FLOAT(DEFAULT.opacity);
	pixelRatio = ParamConfig.INTEGER(DEFAULT.pixelRatio, {
		range: [1, 4],
		rangeLocked: [true, false],
	});
	/** @param multisamples */
	multisamples = ParamConfig.INTEGER(DEFAULT.multisamples, {
		range: [0, 4],
		rangeLocked: [true, false],
	});
	/** @param toggle to activate blur */
	tblur = ParamConfig.BOOLEAN(DEFAULT.tblur);
	/** @param blur amount */
	blur = ParamConfig.FLOAT(DEFAULT.blur, {
		visibleIf: {tblur: 1},
	});
	/** @param vertical blur multiplier */
	verticalBlurMult = ParamConfig.FLOAT(DEFAULT.verticalBlurMult, {
		visibleIf: {tblur: 1},
	});
	/** @param toggle to activate a second blur, which can be useful to reduce artefacts */
	tblur2 = ParamConfig.BOOLEAN(DEFAULT.tblur2, {
		visibleIf: {tblur: 1},
	});
	/** @param blur2 amount */
	blur2 = ParamConfig.FLOAT(DEFAULT.blur2, {
		visibleIf: {tblur: 1, tblur2: 1},
	});
	/** @param vertical blur2 multiplier */
	verticalBlur2Mult = ParamConfig.FLOAT(DEFAULT.verticalBlur2Mult, {
		visibleIf: {tblur: 1, tblur2: 1},
	});
}
const ParamsConfig = new ReflectorSopParamsConfig();

export class ReflectorSopNode extends TypedSopNode<ReflectorSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.REFLECTOR;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.threejsObjectsWithGeo();
		for (const object of objects) {
			Poly.onObjectsAddRemoveHooks.assignOnAddHookHandler(object, this);
		}
		this.setCoreGroup(coreGroup);
	}
	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
		const _geometry = (object as Mesh).geometry;
		if (!_geometry) {
			return;
		}
		// since the geometry is rotated in this method,
		// we could end up with rotating it multiple times
		// if we were to toggle the display flag between this node and another.
		// The current fix is to clone the geometry before transforming it.
		const clonedGeometry = _geometry.clone();

		const renderer = this.scene().renderersRegister.lastRegisteredRenderer();

		_v3.copy(this.pv.direction).normalize().multiplyScalar(this.pv.directionOffset);

		clonedGeometry.translate(-_v3.x, -_v3.y, -_v3.z);
		Reflector.rotateGeometry(clonedGeometry, this.pv.direction);

		const reflector = new Reflector(clonedGeometry, {
			clipBias: this.pv.clipBias,
			renderer,
			scene: this.scene().threejsScene(),
			pixelRatio: this.pv.pixelRatio,
			multisamples: this.pv.multisamples,
			color: this.pv.color,
			opacity: this.pv.opacity,
			useVertexColor: this.pv.useVertexColor,
			reflectionBlend: this.pv.reflectionBlend,
			active: this.pv.active,
			tblur: this.pv.tblur,
			blur: this.pv.blur,
			verticalBlurMult: this.pv.verticalBlurMult,
			tblur2: this.pv.tblur2,
			blur2: this.pv.blur2,
			verticalBlur2Mult: this.pv.verticalBlur2Mult,
		});
		reflector.matrixAutoUpdate = false;
		// make sure object attributes are up to date
		object.matrix.decompose(object.position, object.quaternion, object.scale);
		_v3.add(object.position);
		reflector.position.copy(_v3);
		reflector.rotation.copy(object.rotation);
		reflector.scale.copy(object.scale);
		reflector.updateMatrix();
		Reflector.compensateGeometryRotation(reflector, this.pv.direction);
		replaceChild(parent, object, reflector);
	}
}
