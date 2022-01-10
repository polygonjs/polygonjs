import {BaseNodeType} from '../../../nodes/_Base';
import {BaseParamType} from '../../../params/_Base';
import {MissingReference} from './MissingReference';
import {MapUtils} from '../../../../core/MapUtils';
import {PolyScene} from '../../PolyScene';
import {CoreWalker} from '../../../../core/Walker';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {SetUtils} from '../../../../core/SetUtils';

export class MissingReferencesController {
	private references: Map<CoreGraphNodeId, Set<MissingReference>> = new Map();

	constructor(private scene: PolyScene) {}

	register(param: BaseParamType, path: string): MissingReference {
		const missingReference = new MissingReference(param, path);

		MapUtils.addToSetAtEntry(this.references, param.graphNodeId(), missingReference);

		return missingReference;
	}
	deregisterParam(param: BaseParamType) {
		this.references.delete(param.graphNodeId());
	}

	//
	//
	// MISSING REFERENCES
	//
	//
	resolveMissingReferences() {
		const resolvedReferences: MissingReference[] = [];
		this.references.forEach((references) => {
			for (let reference of references) {
				if (this._isReferenceResolvable(reference)) {
					resolvedReferences.push(reference);
				}
			}
		});
		for (let reference of resolvedReferences) {
			reference.resolveMissingDependencies();
		}
	}
	private _isReferenceResolvable(reference: MissingReference) {
		const absolutePath = reference.absolutePath();
		if (absolutePath) {
			const node = this.scene.node(absolutePath);
			// try and find a node first
			if (node) {
				return true;
			} else {
				// if no node, try and find a param, via a parent first
				const paths = CoreWalker.splitParentChild(absolutePath);
				if (paths.child) {
					const parentNode = this.scene.node(paths.parent);
					if (parentNode) {
						const param = parentNode.params.get(paths.child);
						if (param) {
							return true;
						}
					}
				}
			}
		}
	}

	// call this from node.create and node.rename
	checkForMissingReferences(node: BaseNodeType) {
		this._checkForMissingReferencesForNode(node);
		for (let param of node.params.all) {
			this._checkForMissingReferencesForParam(param);
		}
	}
	private _checkForMissingReferencesForNode(node: BaseNodeType) {
		const id = node.graphNodeId();

		const missingReferences = MapUtils.arrayFromValues(this.references);
		for (let missingReference of missingReferences) {
			let matchFound = false;
			const list = SetUtils.toArray(missingReference);
			for (let ref of list) {
				if (ref.matchesPath(node.path())) {
					matchFound = true;
					ref.resolveMissingDependencies();
				}
			}
			if (matchFound) {
				this.references.delete(id);
			}
		}
	}
	private _checkForMissingReferencesForParam(param: BaseParamType) {
		const id = param.graphNodeId();

		const missingReferences = MapUtils.arrayFromValues(this.references);
		for (let missingReference of missingReferences) {
			let matchFound = false;
			const list = SetUtils.toArray(missingReference);
			for (let ref of list) {
				if (ref.matchesPath(param.path())) {
					matchFound = true;
					ref.resolveMissingDependencies();
				}
			}
			if (matchFound) {
				this.references.delete(id);
			}
		}
	}
}
