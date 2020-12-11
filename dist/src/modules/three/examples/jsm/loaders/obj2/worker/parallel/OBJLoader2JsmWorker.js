import {OBJLoader2Parser as OBJLoader2Parser2} from "../../OBJLoader2Parser.js";
import {
  WorkerRunner as WorkerRunner2,
  DefaultWorkerPayloadHandler
} from "./WorkerRunner.js";
new WorkerRunner2(new DefaultWorkerPayloadHandler(new OBJLoader2Parser2()));
