/**
 * A solver re-uses its output as its input on each iteration
 *
 */
import {BaseNodeType} from './../_Base';
import {SolverIterationStamp} from './utils/SolverIterationStamp';
import {NetworkNodeType} from './../../poly/NodeContext';
import {SubnetSopNodeLike, SopSubnetChildrenDisplayController} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {DisplayNodeController} from '../utils/DisplayNodeController';

class SolverSopParamsConfig extends NodeParamsConfig {
	/** @param number of times the nodes inside this node will process the input */
	iterations = ParamConfig.INTEGER(2, {
		range: [0, 5],
		rangeLocked: [true, false],
	});
	/** @param Currently, when the child nodes are updated, the solver node does not know that it should recook. Clicking this button forces it to recompute */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SolverSopNode.PARAM_CALLBACK_reload(node as SolverSopNode);
		},
	});
}
const ParamsConfig = new SolverSopParamsConfig();

export class SolverSopNode extends SubnetSopNodeLike<SolverSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SOLVER;
	}
	private _iterationStamp: SolverIterationStamp | undefined;
	public override readonly childrenDisplayController: SopSubnetChildrenDisplayController =
		new SopSubnetChildrenDisplayController(this, {dependsOnDisplayNode: false});
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		{
			onDisplayNodeRemove: () => {
				// this.node.setDirty();
			},
			onDisplayNodeSet: () => {
				// this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				// this.node.setDirty();
			},
		},
		{dependsOnDisplayNode: false}
	);

	override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}
	iterationStamp() {
		return (this._iterationStamp = this._iterationStamp || this._createStampNode());
	}
	private _createStampNode() {
		const stampNode = new SolverIterationStamp(this.scene());
		this.dirtyController.setForbiddenTriggerNodes([stampNode]);
		return stampNode;
	}

	private _previousFrameCoreGroup: CoreGroup | undefined;
	previousFrameCoreGroup() {
		return this._previousFrameCoreGroup;
	}
	override async cook(inputCoreGroups: CoreGroup[]) {
		// if (this.pv.startFrame == this.scene().frame()) {
		// 	this._reset();
		// }
		this._reset();

		if (this.pv.iterations == 0) {
			this.setCoreGroup(inputCoreGroups[0]);
			return;
		}

		// await this.computeSolverIfRequired();
		await this._computeSolverMultipleTimes(this.pv.iterations);
	}

	private _reset() {
		this._previousFrameCoreGroup = undefined;

		if (this.iterationStamp().iteration() == 0) {
			this.iterationStamp().setIteration(-1);
		}

		// this._lastSimulatedFrame = null;
		// this._currentIteration = 0
	}

	// private async computeSolverIfRequired() {
	// 	const frame = this.scene().frame();
	// 	const startFrame: number = this.pv.startFrame;
	// 	if (frame >= startFrame) {
	// 		if (this._lastSimulatedFrame == null) {
	// 			this._lastSimulatedFrame = startFrame - 1;
	// 		}

	// 		if (frame > this._lastSimulatedFrame) {
	// 			await this._computeSolverMultipleTimes(frame - this._lastSimulatedFrame);
	// 		}
	// 	}
	// }
	private async _computeSolverMultipleTimes(iterationsCount: number) {
		for (let i = 0; i < iterationsCount; i++) {
			this.iterationStamp().setIteration(i);
			await this.computeSolver(i == iterationsCount - 1);
		}
		// this._lastSimulatedFrame = this.scene().frame();
	}
	private async computeSolver(isLastIteration: boolean) {
		const childOutputNode = this.childrenDisplayController.outputNode();
		let coreContent: CoreGroup | undefined;
		if (childOutputNode) {
			const container = await childOutputNode.compute();
			coreContent = container.coreContent();
			if (coreContent) {
				this._previousFrameCoreGroup = coreContent;
			} else {
				if (childOutputNode.states.error.active()) {
					this.states.error.set(childOutputNode.states.error.message());
				} else {
					this._previousFrameCoreGroup = undefined;
				}
			}
		} else {
			this.states.error.set('no output node found inside subnet');
		}

		if (isLastIteration) {
			if (coreContent) {
				this.setCoreGroup(coreContent);
			} else {
				this.setObjects([]);
			}
		}
	}

	// isOnFrameStart(): boolean {
	// 	return this.scene().frame() == this.pv.startFrame;
	// }
	static PARAM_CALLBACK_reload(node: SolverSopNode) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		this.p.iterations.setDirty();
	}
}
