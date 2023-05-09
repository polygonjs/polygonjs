import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import {SDFGeometry} from '../../../core/geometry/sdf/SDFCommon';
import {SDFObject} from '../../../core/geometry/sdf/SDFObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {ModuleName} from '../../poly/registers/modules/Common';

export class SDFSopNode<K extends NodeParamsConfig> extends TypedSopNode<K> {
	override dataType(): string {
		return CoreObjectType.SDF;
	}
	override requiredModules() {
		return [ModuleName.SDF];
	}
	setSDFGeometry(geometry: SDFGeometry) {
		const objects = [new SDFObject(geometry)];
		this._setContainerSDFObjects(objects);
	}
	setSDFObjects(objects: SDFObject[]) {
		this._setContainerSDFObjects(objects);
	}

	protected _setContainerSDFObjects(objects: SDFObject[]) {
		const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
		coreGroup.setAllObjects(objects);
		this._setContainer(coreGroup);
	}
}

export type BaseSDFSopNodeType = SDFSopNode<NodeParamsConfig>;
export class BaseSDFSopNodeClass extends SDFSopNode<NodeParamsConfig> {}
