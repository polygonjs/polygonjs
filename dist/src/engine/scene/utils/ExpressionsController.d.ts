import { BaseParamType } from '../../params/_Base';
import { BaseNodeType } from '../../nodes/_Base';
export declare class ExpressionsController {
    private _params_by_id;
    constructor();
    register_param(param: BaseParamType): void;
    deregister_param(param: BaseParamType): void;
    regenerate_referring_expressions(node: BaseNodeType): void;
}
