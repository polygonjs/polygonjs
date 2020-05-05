import { PolyScene } from '../PolyScene';
import { EventContext } from './events/_BaseEventsController';
export declare class LoadingController {
    private scene;
    constructor(scene: PolyScene);
    private _LOADED_EVENT_CONTEXT;
    get LOADED_EVENT_CONTEXT(): EventContext<Event>;
    _loading_state: boolean;
    _auto_updating: boolean;
    _first_object_loaded: boolean;
    mark_as_loading(): void;
    mark_as_loaded(): Promise<void>;
    private _set_loading_state;
    get is_loading(): boolean;
    get loaded(): boolean;
    get auto_updating(): boolean;
    set_auto_update(new_state: boolean): Promise<void>;
    on_first_object_loaded(): void;
}
