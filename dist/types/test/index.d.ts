import 'qunit';
import './assertions';
declare global {
    interface Window {
        QUnit: QUnit;
    }
}
import './core/object';
