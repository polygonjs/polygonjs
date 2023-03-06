/**
 * Deletes an attribute from the geometry or object.
 *
 *
 */
import {TypeAssert} from './../../poly/Assert';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {AttribClassMenuEntries, AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D, BufferGeometry, Mesh} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribDeleteSopParamsConfig extends NodeParamsConfig {
	/** @param attribute class (geometry or object) */
	class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX), {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param attribute name to delete */
	name = ParamConfig.STRING('');
}
const ParamsConfig = new AttribDeleteSopParamsConfig();

export class AttribDeleteSopNode extends TypedSopNode<AttribDeleteSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribDelete';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to delete attributes from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const attribClass = ATTRIBUTE_CLASSES[this.pv.class];
		const attribNames = this._attribNames(coreGroup, attribClass);
		for (let attribName of attribNames) {
			this._deleteAttrib(coreGroup, attribName, attribClass);
		}

		this.setCoreGroup(coreGroup);
	}

	private _attribNames(coreGroup: CoreGroup, attribClass: AttribClass) {
		switch (attribClass) {
			case AttribClass.VERTEX:
				return coreGroup.geoAttribNamesMatchingMask(this.pv.name);
			case AttribClass.OBJECT:
				return coreGroup.objectAttribNamesMatchingMask(this.pv.name);
			case AttribClass.CORE_GROUP:
				return coreGroup.attribNamesMatchingMask(this.pv.name);
		}
		TypeAssert.unreachable(attribClass);
	}
	private _deleteAttrib(coreGroup: CoreGroup, attribName: string, attribClass: AttribClass) {
		switch (attribClass) {
			case AttribClass.VERTEX:
				return this._deleteVertexAttribute(coreGroup, attribName);
			case AttribClass.OBJECT:
				return this._deleteObjectAttribute(coreGroup, attribName);
			case AttribClass.CORE_GROUP:
				return this._deleteCoreGroupAttribute(coreGroup, attribName);
		}
		TypeAssert.unreachable(attribClass);
	}

	private _deleteVertexAttribute(core_group: CoreGroup, attribName: string) {
		const objects = core_group.threejsObjects();
		for (let object of objects) {
			object.traverse((object3d: Object3D) => {
				const child = object3d as Mesh;
				if (child.geometry) {
					const core_geometry = new CoreGeometry(child.geometry as BufferGeometry);
					core_geometry.deleteAttribute(attribName);
				}
			});
		}
	}
	private _deleteObjectAttribute(coreGroup: CoreGroup, attribName: string) {
		const coreObjects = coreGroup.allCoreObjects();
		for (let coreObject of coreObjects) {
			coreObject.deleteAttribute(attribName);
		}
	}
	private _deleteCoreGroupAttribute(coreGroup: CoreGroup, attribName: string) {
		coreGroup.deleteAttribute(attribName);
	}
}
