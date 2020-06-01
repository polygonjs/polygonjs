import { BaseParamType } from '../../../params/_Base';
declare type LabelControllerCallback = () => string;
export declare class ParamsLabelController {
    private _callback;
    private _params;
    constructor();
    params(): BaseParamType[] | undefined;
    callback(): LabelControllerCallback | undefined;
    init(params: BaseParamType[], callback?: LabelControllerCallback): void;
}
export {};
