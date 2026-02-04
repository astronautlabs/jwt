import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const config: Config = {
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    extensionsToTreatAsEsm: [".ts"],
    roots: [ "src/node" ],
    testMatch: ["**/*.test.ts"],
    watchman: false,
    ...createDefaultPreset({
        tsconfig: './tsconfig.esm.json',
        useESM: true
    })
};

export default config;