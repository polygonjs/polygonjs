/**
 * Uses a flat mesh and renders soft contact shadows on it
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {Number3} from '../../../types/GlobalTypes';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Poly} from '../../Poly';
import {Object3D, Mesh, Vector2, Vector3} from 'three';
// import {copyBasicObjectProperties} from '../../poly/PolyOnObjectsAddedHooksController';
import {ContactShadowController} from '../../../core/contactShadows/ContactShadow';
import {PlaneSopOperation, DEFAULT_PARAMS as DEFAULT_PLANE_PARAMS} from '../../operations/sop/Plane';

const DEFAULT_PLANE_SIZE = new Vector2(10, 10);
const DEFAULT_PLANE_CENTER = new Vector3(0, +0.01, 0);

class ContactShadowsSopParamsConfig extends NodeParamsConfig {
	renderAllObjects = ParamConfig.BOOLEAN(true);
	objects = ParamConfig.STRING('', {
		visibleIf: {renderAllObjects: 0},
		objectMask: {fromInputOnly: false},
	});
	/** @param distance from the ground up to which shadows are visible */
	dist = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param shadow resolution */
	shadowRes = ParamConfig.VECTOR2([256, 256]);
	/** @param shadow opacity */
	opacity = ParamConfig.FLOAT(1);
	/** @param blur amount */
	blur = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
	/** @param toggle on to add a secondary blur, which may be useful to get rid of artefacts */
	tblur2 = ParamConfig.BOOLEAN(1);
	/** @param secondary blur amount */
	blur2 = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {tblur2: 1},
	});
	/** @param show helper */
	showHelper = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
}
const ParamsConfig = new ContactShadowsSopParamsConfig();

export class ContactShadowsSopNode extends TypedSopNode<ContactShadowsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CONTACT_SHADOWS;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	private _planeOperation: PlaneSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0] || this._defaultCoreGroup();

		const objects = coreGroup.threejsObjectsWithGeo();
		for (const object of objects) {
			Poly.onObjectsAddedHooks.assignHookHandler(object, this);
		}
		this.setCoreGroup(coreGroup);
	}
	private _defaultCoreGroup() {
		this._planeOperation = this._planeOperation || new PlaneSopOperation(this.scene(), this.states);
		const coreGroup = this._planeOperation.cook([], {
			...DEFAULT_PLANE_PARAMS,
			size: DEFAULT_PLANE_SIZE,
			center: DEFAULT_PLANE_CENTER,
		});
		return coreGroup;
	}
	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}
		this._lastContactShadowsController = new ContactShadowController({
			scene: this.scene(),
			mesh: object as Mesh,
			dist: this.pv.dist,
			renderTargetSize: this.pv.shadowRes,
			darkness: this.pv.opacity,
			blur: this.pv.blur,
			tblur2: this.pv.tblur2,
			blur2: this.pv.blur2,
			renderAllObjects: this.pv.renderAllObjects,
			objectsMask: this.pv.objects,
			showHelper: this.pv.showHelper,
		});
	}
	private _lastContactShadowsController: ContactShadowController | undefined;
	lastContactShadowsController() {
		return this._lastContactShadowsController;
	}
}
