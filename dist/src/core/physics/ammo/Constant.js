export var CollisionFlag;
(function(CollisionFlag2) {
  CollisionFlag2[CollisionFlag2["STATIC_OBJECT"] = 1] = "STATIC_OBJECT";
  CollisionFlag2[CollisionFlag2["KINEMATIC_OBJECT"] = 2] = "KINEMATIC_OBJECT";
  CollisionFlag2[CollisionFlag2["NO_CONTACT_RESPONSE"] = 4] = "NO_CONTACT_RESPONSE";
})(CollisionFlag || (CollisionFlag = {}));
export var BodyState;
(function(BodyState2) {
  BodyState2[BodyState2["ACTIVE_TAG"] = 1] = "ACTIVE_TAG";
  BodyState2[BodyState2["ISLAND_SLEEPING"] = 2] = "ISLAND_SLEEPING";
  BodyState2[BodyState2["WANTS_DEACTIVATION"] = 3] = "WANTS_DEACTIVATION";
  BodyState2[BodyState2["DISABLE_DEACTIVATION"] = 4] = "DISABLE_DEACTIVATION";
  BodyState2[BodyState2["DISABLE_SIMULATION"] = 5] = "DISABLE_SIMULATION";
})(BodyState || (BodyState = {}));
