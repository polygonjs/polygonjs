import {TimeDependentState} from "./states/TimeDependent";
import {ErrorState} from "./states/Error";
export class StatesController {
  constructor(param) {
    this.param = param;
    this.time_dependent = new TimeDependentState(this.param);
    this.error = new ErrorState(this.param);
  }
}
