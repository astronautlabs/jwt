import * as karma from 'karma';
import * as path from 'path';

export default function (config : karma.Config) {
    config.set(<karma.ConfigOptions & { webpack: any }>{
        basePath: '',
        files: [
            { pattern: 'src/polyfills.test.ts' },
            { pattern: 'src/*.test.ts' },
            { pattern: 'src/browser/**/*.test.ts' }
        ],
        browsers: ['Chrome'],
        preprocessors: {
            '**/*.test.ts': ['webpack']
        },
        frameworks: [
            'webpack'
        ],
        webpack: {
            devtool: 'inline-source-map',
            externals: {
              fs: 'undefined'
            }, 
            output: {
              path: path.join(__dirname, 'tmp'),
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        include: path.join(__dirname, 'src'),
                        use: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    compilerOptions: {
                                        module: "ES2015",
                                        target: "ES2015",
                                        moduleResolution: "node"
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            resolve: {
              extensions: [ '.ts', '.js' ],
              fallback: {
                "os": require.resolve('os-browserify'),
                "stream": require.resolve('stream-browserify'),
                "path": require.resolve('path-browserify')
              }
            },
        },

        reporters: [ 'progress' ],
        webpackMiddleware: { stats: 'errors-only' },
    });
}