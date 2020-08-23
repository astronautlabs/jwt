import { engineTest } from "../engine.test";
import { createJWTEngine } from "./index";

engineTest('NodeJWT', createJWTEngine());