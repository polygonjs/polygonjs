/**
 * A solver re-uses its output as its input on each frame
 *
 */
import {NetworkNodeType} from './../../poly/NodeContext';
import {SubnetSopNodeLike, SopSubnetChildrenDisplayController} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {DisplayNodeController} from '../utils/DisplayNodeController';

class SolverSopParamsConfig extends NodeParamsConfig {
	iterations = ParamConfig.INTEGER(2, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SolverSopParamsConfig();

export class SolverSopNode extends SubnetSopNodeLike<SolverSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SOLVER;
	}
	private _currentIteration: number = 0;
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

		// this.addGraphInput(this.scene().timeController.graphNode);
	}

	currentIteration() {
		return this._currentIteration;
	}
	private _previousFrameCoreGroup: CoreGroup | undefined;
	previousFrameCoreGroup() {
		return this._previousFrameCoreGroup;
	}
	override async cook(inputCoreGroups: CoreGroup[]) {
		console.log('cook');
		// if (this.pv.startFrame == this.scene().frame()) {
		// 	this._reset();
		// }
		this._reset();
		// await this.computeSolverIfRequired();
		await this._computeSolverMultipleTimes(this.pv.iterations);
	}

	private _reset() {
		this._previousFrameCoreGroup = undefined;
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
		console.log('_computeSolverMultipleTimes', iterationsCount);
		for (let i = 0; i < iterationsCount; i++) {
			this._currentIteration = i;
			console.log('compute', i);
			await this.computeSolver();
		}
		// this._lastSimulatedFrame = this.scene().frame();
	}
	private async computeSolver() {
		const childOutputNode = this.childrenDisplayController.outputNode();
		if (childOutputNode) {
			const container = await childOutputNode.compute();
			const coreContent = container.coreContent();
			console.log(coreContent);
			if (coreContent) {
				this._previousFrameCoreGroup = coreContent;
				this.setCoreGroup(coreContent);
			} else {
				if (childOutputNode.states.error.active()) {
					this.states.error.set(childOutputNode.states.error.message());
				} else {
					this._previousFrameCoreGroup = undefined;
					this.setObjects([]);
				}
			}
		} else {
			this.states.error.set('no output node found inside subnet');
		}
	}

	// isOnFrameStart(): boolean {
	// 	return this.scene().frame() == this.pv.startFrame;
	// }
}
