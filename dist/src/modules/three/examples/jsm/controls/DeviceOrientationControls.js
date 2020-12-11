import {Euler as Euler2} from "three/src/math/Euler";
import {EventDispatcher as EventDispatcher2} from "three/src/core/EventDispatcher";
import {MathUtils as MathUtils2} from "three/src/math/MathUtils";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {Vector3 as Vector32} from "three/src/math/Vector3";
var DeviceOrientationControls = function(object) {
  var scope = this;
  var changeEvent = {type: "change"};
  var EPS = 1e-6;
  this.object = object;
  this.object.rotation.reorder("YXZ");
  this.enabled = true;
  this.deviceOrientation = {};
  this.screenOrientation = 0;
  this.alphaOffset = 0;
  var onDeviceOrientationChangeEvent = function(event) {
    scope.deviceOrientation = event;
  };
  var onScreenOrientationChangeEvent = function() {
    scope.screenOrientation = window.orientation || 0;
  };
  var setObjectQuaternion = function() {
    var zee = new Vector32(0, 0, 1);
    var euler = new Euler2();
    var q0 = new Quaternion2();
    var q1 = new Quaternion2(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    return function(quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, "YXZ");
      quaternion.setFromEuler(euler);
      quaternion.multiply(q1);
      quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
    };
  }();
  this.connect = function() {
    onScreenOrientationChangeEvent();
    if (window.DeviceOrientationEvent !== void 0 && typeof window.DeviceOrientationEvent.requestPermission === "function") {
      window.DeviceOrientationEvent.requestPermission().then(function(response) {
        if (response == "granted") {
          window.addEventListener("orientationchange", onScreenOrientationChangeEvent, false);
          window.addEventListener("deviceorientation", onDeviceOrientationChangeEvent, false);
        }
      }).catch(function(error) {
        console.error("THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:", error);
      });
    } else {
      window.addEventListener("orientationchange", onScreenOrientationChangeEvent, false);
      window.addEventListener("deviceorientation", onDeviceOrientationChangeEvent, false);
    }
    scope.enabled = true;
  };
  this.disconnect = function() {
    window.removeEventListener("orientationchange", onScreenOrientationChangeEvent, false);
    window.removeEventListener("deviceorientation", onDeviceOrientationChangeEvent, false);
    scope.enabled = false;
  };
  this.update = function() {
    var lastQuaternion = new Quaternion2();
    return function() {
      if (scope.enabled === false)
        return;
      var device = scope.deviceOrientation;
      if (device) {
        var alpha = device.alpha ? MathUtils2.degToRad(device.alpha) + scope.alphaOffset : 0;
        var beta = device.beta ? MathUtils2.degToRad(device.beta) : 0;
        var gamma = device.gamma ? MathUtils2.degToRad(device.gamma) : 0;
        var orient = scope.screenOrientation ? MathUtils2.degToRad(scope.screenOrientation) : 0;
        setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
        if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          lastQuaternion.copy(scope.object.quaternion);
          scope.dispatchEvent(changeEvent);
        }
      }
    };
  }();
  this.dispose = function() {
    scope.disconnect();
  };
  this.connect();
};
DeviceOrientationControls.prototype = Object.create(EventDispatcher2.prototype);
DeviceOrientationControls.prototype.constructor = DeviceOrientationControls;
export {DeviceOrientationControls};
