import {} from 'three/src/';
import {"./WorkerRunner.js";} from 'three/src/"./WorkerRunner.js";';
import {);} from 'three/src/);';
import {DefaultWorkerPayloadHandler} from 'three/src/DefaultWorkerPayloadHandler';
import {WorkerRunner} from 'three/src/WorkerRunner';
/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { OBJLoader2Parser } from "../../OBJLoader2Parser.js";

/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { OBJLoader2Parser } from "../../OBJLoader2Parser.js";

import {
	WorkerRunner,
	DefaultWorkerPayloadHandler
} from "./WorkerRunner.js";

new WorkerRunner( new DefaultWorkerPayloadHandler( new OBJLoader2Parser() ) );
