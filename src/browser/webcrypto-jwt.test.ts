import { engineTest } from "../engine.test";
import { createJWTEngine } from "./index";

engineTest('WebCryptoJWT', createJWTEngine());