import {Curve as Curve2} from "three/src/extras/core/Curve";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {NURBSUtils as NURBSUtils2} from "../curves/NURBSUtils.js";
var NURBSCurve = function(degree, knots, controlPoints, startKnot, endKnot) {
  Curve2.call(this);
  this.degree = degree;
  this.knots = knots;
  this.controlPoints = [];
  this.startKnot = startKnot || 0;
  this.endKnot = endKnot || this.knots.length - 1;
  for (var i = 0; i < controlPoints.length; ++i) {
    var point = controlPoints[i];
    this.controlPoints[i] = new Vector42(point.x, point.y, point.z, point.w);
  }
};
NURBSCurve.prototype = Object.create(Curve2.prototype);
NURBSCurve.prototype.constructor = NURBSCurve;
NURBSCurve.prototype.getPoint = function(t, optionalTarget) {
  var point = optionalTarget || new Vector32();
  var u = this.knots[this.startKnot] + t * (this.knots[this.endKnot] - this.knots[this.startKnot]);
  var hpoint = NURBSUtils2.calcBSplinePoint(this.degree, this.knots, this.controlPoints, u);
  if (hpoint.w != 1) {
    hpoint.divideScalar(hpoint.w);
  }
  return point.set(hpoint.x, hpoint.y, hpoint.z);
};
NURBSCurve.prototype.getTangent = function(t, optionalTarget) {
  var tangent = optionalTarget || new Vector32();
  var u = this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0]);
  var ders = NURBSUtils2.calcNURBSDerivatives(this.degree, this.knots, this.controlPoints, u, 1);
  tangent.copy(ders[1]).normalize();
  return tangent;
};
export {NURBSCurve};
