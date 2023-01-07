// import {BaseSopOperation} from './_Base';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {DefaultOperationParams} from '../../../core/operations/_Base';

// interface WebXRControllerSopParams extends DefaultOperationParams {
// 	index: number;
// 	addTarget: boolean;
// }

// export class WebXRControllerSopOperation extends BaseSopOperation {
// 	static override readonly DEFAULT_PARAMS: WebXRControllerSopParams = {
// 		index: 0,
// 		addTarget: true,
// 	};
// 	static override type(): Readonly<'webXRController'> {
// 		return 'webXRController';
// 	}
// 	override cook(inputCoreGroups: CoreGroup[], params: WebXRControllerSopParams) {
// 		return this.createCoreGroupFromObjects([]);
// 	}
// }
