/**
 * Creates group of edges
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {traverseEdges, traverseFaces} from '../../../core/geometry/cad/CadTraverse';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {GroupByExpressionHelper} from './utils/group/GroupByExpressionHelper';
import {GroupByBoundingBoxHelper} from './utils/group/GroupByBoundingBoxHelper';
import {GroupByBoundingObjectHelper} from './utils/group/GroupByBoundingObjectHelper';
import {isBooleanTrue} from '../../../core/Type';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {OpenCascadeInstance, CadGeometryTypeShape} from '../../../core/geometry/cad/CadCommon';
import {CadCoreEdge} from '../../../core/geometry/cad/CadCoreEdge';
import {
	GroupOperation,
	GROUP_OPERATIONS,
	UpdateGroupOptions,
	EntityGroupType,
} from '../../../core/geometry/EntityGroupCollection';
import {coreObjectInstanceFactory} from '../../../core/geometry/CoreObjectFactory';
import {CoreEntity} from '../../../core/geometry/Entity';
import {CadCoreFace} from '../../../core/geometry/cad/CadCoreFace';

const DISPLAYED_INPUT_NAMES = ['input geometries', 'bounding box (optional)'];

const GROUP_TYPES: EntityGroupType[] = [EntityGroupType.EDGE, EntityGroupType.FACE];

class CADGroupSopParamsConfig extends NodeParamsConfig {
	/** @param group name */
	name = ParamConfig.STRING('');
	/** @param group type */
	type = ParamConfig.INTEGER(GROUP_TYPES.indexOf(EntityGroupType.EDGE), {
		menu: {
			entries: GROUP_TYPES.map((name, value) => ({name, value})),
		},
	});
	/** @param mode */
	operation = ParamConfig.INTEGER(GROUP_OPERATIONS.indexOf(GroupOperation.SET), {
		menu: {
			entries: GROUP_OPERATIONS.map((name, value) => ({name, value})),
		},
	});
	// byExpression
	/** @param deletes objects by an expression */
	byExpression = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	/** @param sets the expression to select what should be deleted */
	expression = ParamConfig.BOOLEAN('@ptnum==0', {
		visibleIf: {byExpression: true},
		expression: {forEntities: true},
	});
	// byBbox
	/** @param deletes objects that are inside a bounding box */
	byBoundingBox = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	/** @param the bounding box size */
	boundingBoxSize = ParamConfig.VECTOR3([1, 1, 1], {
		visibleIf: {
			byBoundingBox: true,
		},
	});
	/** @param the bounding box center */
	boundingBoxCenter = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {
			byBoundingBox: true,
		},
	});

	// byBoundingObject
	/** @param deletes objects that are inside an object. This uses the object from the 2nd input */
	byBoundingObject = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	/** @param invert */
	invert = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
}
const ParamsConfig = new CADGroupSopParamsConfig();

export class CADGroupSopNode extends CADSopNode<CADGroupSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_GROUP;
	}
	static override displayedInputNames(): string[] {
		return DISPLAYED_INPUT_NAMES;
	}
	// public readonly entitySelectionHelper = new EntitySelectionHelper(this);
	public readonly byExpressionHelper = new GroupByExpressionHelper(this);
	public readonly byBoundingBoxHelper = new GroupByBoundingBoxHelper(this);
	public readonly byBoundingObjectHelper = new GroupByBoundingObjectHelper();

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	setGroupType(groupType: EntityGroupType) {
		this.p.type.set(GROUP_TYPES.indexOf(groupType));
	}
	groupType() {
		return GROUP_TYPES[this.pv.type];
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];

		const inputObjects = coreGroup0.cadObjects();
		if (inputObjects) {
			for (let inputObject of inputObjects) {
				if (CoreCadType.isShape(inputObject)) {
					this._evalEdges(oc, inputObject, coreGroup1);
				}
			}

			this.setCADObjects(inputObjects);
		} else {
			this.setCADObjects([]);
		}
	}

	private async _evalEdges(
		oc: OpenCascadeInstance,
		inputObject: CadObject<CadGeometryTypeShape>,
		boundingCoreGroup: CoreGroup
	) {
		const entities: CoreEntity[] = [];
		const shape = inputObject.cadGeometry();
		const type = this.groupType();

		switch (type) {
			case EntityGroupType.EDGE: {
				traverseEdges(oc, shape, (edge, index) => {
					entities.push(new CadCoreEdge(shape, edge, index));
				});
				break;
			}
			case EntityGroupType.FACE: {
				traverseFaces(oc, shape, (face, index) => {
					entities.push(new CadCoreFace(shape, face, index));
				});
				break;
			}
		}

		const selectedIndices: Set<number> = new Set();
		if (isBooleanTrue(this.pv.byExpression)) {
			await this.byExpressionHelper.evalForEntities(entities, selectedIndices);
		}
		if (isBooleanTrue(this.pv.byBoundingBox)) {
			await this.byBoundingBoxHelper.evalForEntities(entities, selectedIndices);
		}
		if (isBooleanTrue(this.pv.byBoundingObject)) {
			await this.byBoundingObjectHelper.evalForEntities(entities, selectedIndices, boundingCoreGroup);
		}
		const coreObject = coreObjectInstanceFactory(inputObject);
		const groupCollection = coreObject.groupCollection();
		const options: UpdateGroupOptions = {
			type,
			groupName: this.pv.name,
			operation: GROUP_OPERATIONS[this.pv.operation],
		};
		groupCollection.updateGroup(options, selectedIndices);
	}
}
