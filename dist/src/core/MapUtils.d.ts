export declare class MapUtils {
    static push_on_array_at_entry<K, V>(map: Map<K, V[]>, key: K, new_element: V): void;
    static pop_from_array_at_entry<K, V>(map: Map<K, V[]>, key: K, element_to_remove: V): void;
    static unshift_on_array_at_entry<K, V>(map: Map<K, V[]>, key: K, new_element: V): void;
    static concat_on_array_at_entry<K, V>(map: Map<K, V[]>, key: K, new_elements: V[]): void;
}
