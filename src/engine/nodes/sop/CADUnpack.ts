/**
 * unpacks a shape into its components
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CadGeometryType, cadGeometryTypeFromShape, cadDowncast} from '../../../core/geometry/modules/cad/CadCommon';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';
import {CadObject} from '../../../core/geometry/modules/cad/CadObject';
import {CoreCadType} from '../../../core/geometry/modules/cad/CadCoreType';

class CADUnpackSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CADUnpackSopParamsConfig();

export class CADUnpackSopNode extends CADSopNode<CADUnpackSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_UNPACK;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputObjects = inputCoreGroup.cadObjects();
		if (inputObjects) {
			const oc = CadLoaderSync.oc();
			for (let inputObject of inputObjects) {
				const shape = inputObject.cadGeometry();
				if (CoreCadType.isGeometryShape(shape)) {
					const iterator = new oc.TopoDS_Iterator_2(shape, true, true);
					while (iterator.More()) {
						const newShape = cadDowncast(oc, iterator.Value());
						const type = cadGeometryTypeFromShape(oc, newShape);
						if (type) {
							const newObject = new CadObject(newShape, type);
							newObjects.push(newObject);
						}

						iterator.Next();
					}
					iterator.delete();
				} else {
					newObjects.push(inputObject);
				}
			}
		}

		this.setCADObjects(newObjects);
	}
}
