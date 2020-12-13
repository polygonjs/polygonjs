import {TimeDependentState} from "./states/TimeDependent";
import {ErrorState} from "./states/Error";
export class StatesController {
  constructor(node) {
    this.node = node;
    this.time_dependent = new TimeDependentState(this.node);
    this.error = new ErrorState(this.node);
  }
}
