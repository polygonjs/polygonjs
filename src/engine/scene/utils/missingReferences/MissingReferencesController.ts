import {BaseNodeType} from '../../../nodes/_Base';
import {BaseParamType} from '../../../params/_Base';
import {MissingReference} from './MissingReference';
import {addToSetAtEntry, mapValuesToArray} from '../../../../core/MapUtils';
import {PolyScene} from '../../PolyScene';
import {CoreWalker} from '../../../../core/Walker';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {setToArray} from '../../../../core/SetUtils';
import jsep from 'jsep';

const _resolvedReferences: MissingReference[] = [];
const _missingReferences: MissingReference[] = [];
const _missingReferencesSet: Set<MissingReference>[] = [];
export class MissingReferencesController {
	private references: Map<CoreGraphNodeId, Set<MissingReference>> = new Map();
	private _toIgnore: WeakMap<jsep.Expression, boolean> = new WeakMap();

	constructor(private scene: PolyScene) {}

	register(param: BaseParamType, path: string, jsepNode?: jsep.Expression): MissingReference | undefined {
		if (jsepNode && this._toIgnore.get(jsepNode) == true) {
			return;
		}

		const missingReference = new MissingReference(param, path);
		addToSetAtEntry(this.references, param.graphNodeId(), missingReference);

		return missingReference;
	}
	deregisterParam(param: BaseParamType) {
		this.references.delete(param.graphNodeId());
	}

	registerToIgnore(jsepNode: jsep.Expression) {
		this._toIgnore.set(jsepNode, true);
	}

	//
	//
	// MISSING REFERENCES
	//
	//
	resolveMissingReferences() {
		_resolvedReferences.length = 0;
		this.references.forEach((references) => {
			references.forEach((reference) => {
				if (this._isReferenceResolvable(reference)) {
					_resolvedReferences.push(reference);
				}
			});
		});
		for (const reference of _resolvedReferences) {
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
	checkForMissingNodeReferences(node: BaseNodeType) {
		if (!node.scene().loadingController.loaded()) {
			return;
		}

		this._checkForMissingReferencesForNode(node);
		for (const param of node.params.all) {
			this._checkForMissingReferencesForParam(param);
		}
	}
	// call this from spare params update
	checkForMissingParamReferences(param: BaseParamType) {
		if (!param.scene().loadingController.loaded()) {
			return;
		}
		this._checkForMissingReferencesForParam(param);
	}
	private _checkForMissingReferencesForNode(node: BaseNodeType) {
		const id = node.graphNodeId();

		mapValuesToArray(this.references, _missingReferencesSet);
		for (const missingReferenceSet of _missingReferencesSet) {
			let matchFound = false;
			setToArray(missingReferenceSet, _missingReferences);
			for (const ref of _missingReferences) {
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

		mapValuesToArray(this.references, _missingReferencesSet);
		for (const missingReferenceSet of _missingReferencesSet) {
			let matchFound = false;
			setToArray(missingReferenceSet, _missingReferences);
			for (const ref of _missingReferences) {
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
