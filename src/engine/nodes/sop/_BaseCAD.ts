import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import {
	CadGeometryType,
	cadGeometryTypeFromShape,
	TopoDS_Shape,
	Geom2d_Curve,
} from '../../../core/geometry/cad/CadCommon';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
import {cadProcessError} from '../../../core/geometry/cad/CadExceptionHandler';
import {ModuleName} from '../../poly/registers/modules/Common';

export class CADSopNode<K extends NodeParamsConfig> extends TypedSopNode<K> {
	override dataType(): string {
		return CoreObjectType.CAD;
	}
	override requiredModules() {
		return [ModuleName.CAD];
	}
	setCADGeom2dCurve(curve: Geom2d_Curve) {
		const objects = [new CadObject(curve, CadGeometryType.CURVE_2D)];
		this._setContainerCadObjects(objects);
	}
	setCADShape(shape: TopoDS_Shape) {
		const oc = CadLoaderSync.oc();
		const type = cadGeometryTypeFromShape(oc, shape) || CadGeometryType.VERTEX;
		const objects = [new CadObject(shape, type)];
		this._setContainerCadObjects(objects);
	}
	setCADShapes(shapes: TopoDS_Shape[]) {
		const oc = CadLoaderSync.oc();
		const objects = shapes.map(
			(shape, i) => new CadObject(shape, cadGeometryTypeFromShape(oc, shape) || CadGeometryType.VERTEX)
		);
		this._setContainerCadObjects(objects);
	}
	setCADObjects(cadObjects: CadObject<CadGeometryType>[]) {
		this._setContainerCadObjects(cadObjects);
	}
	setCADObject(cadObject: CadObject<CadGeometryType>) {
		this._setContainerCadObjects([cadObject]);
	}

	protected _setContainerCadObjects(objects: CadObject<CadGeometryType>[] /*, message: MESSAGE*/) {
		const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
		coreGroup.setAllObjects(objects);
		this._setContainer(coreGroup);
	}

	// error processing
	override processError(e: unknown) {
		return cadProcessError(e);
	}
}

export type BaseCADSopNodeType = CADSopNode<NodeParamsConfig>;
export class BaseCADSopNodeClass extends CADSopNode<NodeParamsConfig> {}
