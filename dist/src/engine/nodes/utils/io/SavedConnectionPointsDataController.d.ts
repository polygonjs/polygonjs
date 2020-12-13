import { NodeContext } from '../../../poly/NodeContext';
import { TypedNode } from '../../_Base';
import { BaseConnectionPointData } from './connections/_Base';
export declare class SavedConnectionPointsDataController<NC extends NodeContext> {
    protected _node: TypedNode<NC, any>;
    private _in;
    private _out;
    constructor(_node: TypedNode<NC, any>);
    set_in(data: BaseConnectionPointData[]): void;
    set_out(data: BaseConnectionPointData[]): void;
    clear(): void;
    in(): BaseConnectionPointData[] | undefined;
    out(): BaseConnectionPointData[] | undefined;
}
