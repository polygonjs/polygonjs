/**
 * parent node for CSG children nodes
 *
 * @remarks
 *
 * This nodes converts the CSG operations created by its children into a geometry format compatible with all other geometry nodes
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {CsgNodeChildrenMap} from '../../poly/registers/nodes/Csg';
import {BaseCsgNodeType} from '../csg/_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {CsgChildrenDisplayController} from './utils/csg/CsgChildrenNodesController';
import {csgToObject3D} from '../../../core/geometry/csg/CsgToObject3D';
import {Object3D} from 'three';
class CsgNetworkParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CsgNetworkParamsConfig();

export class CsgNetworkSopNode extends TypedSopNode<CsgNetworkParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.CSG;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const displayNode = this.displayNodeController.displayNode() as BaseCsgNodeType | undefined;
		if (!displayNode) {
			return this.setCoreGroup(inputCoreGroups[0]);
		}
		const container = await displayNode.compute();
		const csgCoreGroup = container.coreContent();
		if (!csgCoreGroup) {
			return this.setCoreGroup(inputCoreGroups[0]);
			return;
		}
		const csgObjects = csgCoreGroup.objects();
		const objects: Object3D[] = [];
		for (let csgObject of csgObjects) {
			const object = csgToObject3D(csgObject);
			if (object) {
				objects.push(object);
			} else {
				console.warn('csg conversion failed for object', object);
			}
		}
		return this.setObjects(objects);
	}

	/*
	 children
	 */
	// display_node and children_display controllers
	public readonly childrenDisplayController: CsgChildrenDisplayController = new CsgChildrenDisplayController(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//
	protected override _childrenControllerContext = NodeContext.CSG;
	override createNode<S extends keyof CsgNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): CsgNodeChildrenMap[S];
	override createNode<K extends valueof<CsgNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<CsgNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseCsgNodeType[];
	}
	override nodesByType<K extends keyof CsgNodeChildrenMap>(type: K): CsgNodeChildrenMap[K][] {
		return super.nodesByType(type) as CsgNodeChildrenMap[K][];
	}
}
