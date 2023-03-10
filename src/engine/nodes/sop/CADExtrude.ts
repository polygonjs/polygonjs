/**
 * extrudes CAD primitives
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	OpenCascadeInstance,
	gp_Vec,
	CadGC,
	CadGeometryType,
	cadGeometryTypeFromShape,
	GCRegisterFunction,
	cadDowncast,
	TopoDS_Edge,
	TopoDS_Wire,
	TopoDS_Face,
	TopoDS_Shape,
} from '../../../core/geometry/cad/CadCommon';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {isBooleanTrue} from '../../../core/Type';

interface CommonOptions {
	oc: OpenCascadeInstance;
	r: GCRegisterFunction;
	newObjects: CadObject<CadGeometryType>[];
	extrudeDir: gp_Vec;
}

class CADExtrudeSopParamsConfig extends NodeParamsConfig {
	/** @param direction */
	dir = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param height */
	height = ParamConfig.FLOAT(1, {
		range: [-10, 10],
		rangeLocked: [false, false],
	});
	/** @param create caps */
	cap = ParamConfig.BOOLEAN(1);
	/** @param convert caps to faces */
	capsAsFaces = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CADExtrudeSopParamsConfig();

export class CADExtrudeSopNode extends CADSopNode<CADExtrudeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_EXTRUDE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const extrudeDir = CadLoaderSync.gp_Vec;
		extrudeDir.SetCoord_2(
			this.pv.dir.x * this.pv.height,
			this.pv.dir.y * this.pv.height,
			this.pv.dir.z * this.pv.height
		);
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputObjects = inputCoreGroup.cadObjects();
		if (inputObjects) {
			const oc = CadLoaderSync.oc();
			CadGC.withGC((r) => {
				const options: CommonOptions = {
					oc,
					r,
					newObjects,
					extrudeDir,
				};
				for (let object of inputObjects) {
					this._processObject(object, options);
				}
			});
		}

		this.setCADObjects(newObjects);
	}

	private _processObject(object: CadObject<CadGeometryType>, options: CommonOptions) {
		const type = object.type;
		switch (type) {
			case CadGeometryType.VERTEX: {
				return this._processVertexObject(object as CadObject<CadGeometryType.VERTEX>, options);
			}
			case CadGeometryType.EDGE: {
				return this._processEdgeObject(object as CadObject<CadGeometryType.EDGE>, options);
			}
			case CadGeometryType.WIRE: {
				return this._processWireObject(object as CadObject<CadGeometryType.WIRE>, options);
			}
			case CadGeometryType.FACE: {
				return this._processFaceObject(object as CadObject<CadGeometryType.FACE>, options);
			}
			case CadGeometryType.SHELL: {
				return this._processShellObject(object as CadObject<CadGeometryType.SHELL>, options);
			}
			default: {
				return options.newObjects.push(object);
			}
		}
	}
	private _processVertexObject(object: CadObject<CadGeometryType.VERTEX>, options: CommonOptions) {
		const {oc, r, newObjects, extrudeDir} = options;
		const vertex = object.cadGeometry();
		const prismApi = r(new oc.BRepPrimAPI_MakePrism_1(vertex, extrudeDir, false, true));
		const prism = prismApi.Shape();
		const type = cadGeometryTypeFromShape(oc, prism);
		if (type) {
			const newObject = new CadObject(prism, type);
			newObjects.push(newObject);
		}
	}
	private _processEdgeObject(object: CadObject<CadGeometryType.EDGE>, options: CommonOptions) {
		const {oc, r, extrudeDir, newObjects} = options;

		const edge = object.cadGeometry() as TopoDS_Edge;
		const api = r(new oc.BRepPrimAPI_MakePrism_1(edge, extrudeDir, false, true));
		const shapes = [api.Shape()];
		// if (isBooleanTrue(this.pv.cap)) {
		// 	const addCap = (capShape: TopoDS_Shape | undefined, invert: boolean) => {
		// 		if (!capShape) {
		// 			return;
		// 		}
		// 		console.log('capShape', capShape, cadGeometryTypeFromShape(oc, capShape));
		// 		if (cadGeometryTypeFromShape(oc, capShape) == CadGeometryType.WIRE) {
		// 			const wire = cadDowncast(oc, capShape) as TopoDS_Wire;
		// 			if (isBooleanTrue(this.pv.capsAsFaces)) {
		// 				const capApi = r(new oc.BRepBuilderAPI_MakeFace_15(wire, true));
		// 				if (capApi.IsDone()) {
		// 					const face = capApi.Face();
		// 					shapes.push(invert ? face.Complemented() : face);
		// 				}
		// 			} else {
		// 				shapes.push(capShape);
		// 			}
		// 		}
		// 	};
		// 	addCap(api.FirstShape(), true);
		// 	addCap(api.LastShape(), false);
		// }
		for (let shape of shapes) {
			const type = cadGeometryTypeFromShape(oc, shape);
			if (type) {
				const newObject = new CadObject(shape, type);
				newObjects.push(newObject);
			}
		}

		// convert to a wire
		// const api = new oc.BRepBuilderAPI_MakeWire_1();
		// const edge = cadDowncast(oc, object.cadGeometry()) as TopoDS_Edge;
		// api.Add_1(edge);
		// const wire = api.Wire();
		// api.delete();

		// // process as wire
		// this._processWire(wire, options);
	}
	private _processWireObject(object: CadObject<CadGeometryType.WIRE>, options: CommonOptions) {
		const wire = object.cadGeometry();
		this._processWire(wire, options);
	}
	private _processWire(wire: TopoDS_Wire, options: CommonOptions) {
		const {oc, r, extrudeDir, newObjects} = options;

		const api = r(new oc.BRepPrimAPI_MakePrism_1(wire, extrudeDir, false, true));
		const shapes = [api.Shape()];
		if (isBooleanTrue(this.pv.cap)) {
			const addCap = (capShape: TopoDS_Shape | undefined, invert: boolean) => {
				if (!capShape) {
					return;
				}
				if (cadGeometryTypeFromShape(oc, capShape) == CadGeometryType.WIRE) {
					const wire = cadDowncast(oc, capShape) as TopoDS_Wire;
					if (isBooleanTrue(this.pv.capsAsFaces)) {
						const capApi = r(new oc.BRepBuilderAPI_MakeFace_15(wire, true));
						if (capApi.IsDone()) {
							const face = capApi.Face();
							shapes.push(invert ? face.Complemented() : face);
						}
					} else {
						shapes.push(capShape);
					}
				}
			};
			addCap(api.FirstShape(), false);
			addCap(api.LastShape(), true);
		}
		for (let shape of shapes) {
			const type = cadGeometryTypeFromShape(oc, shape);
			if (type) {
				const newObject = new CadObject(shape, type);
				newObjects.push(newObject);
			}
		}

		// TODO: cad/convert or cad/makeFace
		// const faceApi = r(new oc.BRepBuilderAPI_MakeFace_15(wire, true));
		// const face = faceApi.Face();
		// this._processFace(face, options);
	}
	private _processFaceObject(object: CadObject<CadGeometryType.FACE>, options: CommonOptions) {
		this._processFace(object.cadGeometry(), options);
	}
	private _processFace(face: TopoDS_Face, options: CommonOptions) {
		const {oc, r, newObjects, extrudeDir} = options;

		const api = r(new oc.BRepPrimAPI_MakePrism_1(face, extrudeDir, false, true));
		const shapes = [api.Shape()];
		// if (isBooleanTrue(this.pv.cap)) {
		// 	const addCap = (capShape: TopoDS_Shape | undefined, invert: boolean) => {
		// 		if (!capShape) {
		// 			return;
		// 		}
		// 		if (cadGeometryTypeFromShape(oc, capShape) == CadGeometryType.WIRE) {
		// 			const wire = cadDowncast(oc, capShape) as TopoDS_Wire;
		// 			if (isBooleanTrue(this.pv.capsAsFaces)) {
		// 				const capApi = r(new oc.BRepBuilderAPI_MakeFace_15(wire, true));
		// 				if (capApi.IsDone()) {
		// 					const face = capApi.Face();
		// 					shapes.push(invert ? face.Complemented() : face);
		// 				}
		// 			} else {
		// 				shapes.push(capShape);
		// 			}
		// 		}
		// 	};
		// 	addCap(api.FirstShape(), true);
		// 	addCap(api.LastShape(), false);
		// }
		for (let shape of shapes) {
			const type = cadGeometryTypeFromShape(oc, shape);
			if (type) {
				const newObject = new CadObject(shape, type);
				newObjects.push(newObject);
			}
		}
	}
	private _processShellObject(object: CadObject<CadGeometryType.SHELL>, options: CommonOptions) {
		const {oc, r, newObjects, extrudeDir} = options;

		const shell = object.cadGeometry();
		const prismApi = r(new oc.BRepPrimAPI_MakePrism_1(shell, extrudeDir, false, true));
		const prism = prismApi.Shape();
		const type = cadGeometryTypeFromShape(oc, prism);
		if (type) {
			const newObject = new CadObject(prism, type);
			newObjects.push(newObject);
		}
	}
}
