import { PerformanceNode } from './PerformanceNode';
import { BaseNodeType } from '../../engine/nodes/_Base';
export declare class CorePerformance {
    private _started;
    _start_time: number | null;
    _previous_timestamp: number;
    _nodes_cook_data: Dictionary<PerformanceNode>;
    _durations_by_name: Dictionary<number>;
    _durations_count_by_name: Dictionary<number>;
    profile(name: string, method: (args?: any) => any): void;
    start(): void;
    stop(): void;
    reset(): void;
    get started(): boolean;
    record_node_cook_data(node: BaseNodeType): void;
    record(name: string): number;
    print(): void;
    print_node_cook_data(): import("./PerformanceNode").PerformancePrintObject[];
    print_recordings(): {
        duration: number;
        name: string;
        count: number;
        duration_per_iteration: number;
    }[];
}
