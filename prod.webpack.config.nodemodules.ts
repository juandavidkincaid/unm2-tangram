import path from 'path';
import { cpus } from "os";
import fs from 'fs-extra';
import webpack, {Configuration, Compiler} from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import TsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebPackPlugin from 'html-webpack-plugin';


const prodOrDev = (a: any, b: any)=>{
    return process.env.NODE_ENV === 'production' ? a : b;
};

const aliases = {
    /*Commons: path.resolve(__dirname, 'src/Commons'),*/
    '@tangram-src': path.resolve(__dirname, 'src'),
    '@tangram-core': path.resolve(__dirname, 'src/core'),
    '@tangram-util': path.resolve(__dirname, 'src/util'),
    '@tangram-res': path.resolve(__dirname, 'src/res'),
    '@tangram-styling': path.resolve(__dirname, 'src/styling'),
    '@tangram-components': path.resolve(__dirname, 'src/components'),
    '@tangram-game': path.resolve(__dirname, 'src/game')
}

const baseConfig: Configuration = {
    module: {
        rules: [
            {
                enforce: "pre",
                // We only want js files, don't add typescript.
                test: /\.js$/,
                loader: "source-map-loader",
            },
            {
                test: /\.svg$|\.ttf$|\.njk$|\.jpg$|\.png$/i,
                type: 'asset/resource',
                generator: {
                    filename: '[hash][ext]'
                }
            },
            {
                test: /\.(ts)$/i,
                exclude: [
                    path.resolve(__dirname, 'src/res'),
                    /(node_modules|bower_components)/,
                ],
                use: [
                    prodOrDev(false, {
                        loader: "thread-loader", // Throw ts-loader into multi-threading to speed things up.
                        options: {
                            workers: cpus.length - 1,
                            poolTimeout: Infinity,
                        },
                    }),
                    {
                        loader: "babel-loader",
                        options:{
                            plugins: [
                                prodOrDev(false, "babel-plugin-styled-components")
                            ].filter(Boolean)
                        }
                    },
                    {
                        loader: "ts-loader",
                        options:{
                            happyPackMode: true,
                            transpileOnly: true
                        }
                    }
                ].filter(Boolean)
            },
            {
                test: /\.(tsx?)$/i,
                exclude: [
                    path.resolve(__dirname, 'src/res'),
                    /(node_modules|bower_components)/,
                ],
                use: [
                    prodOrDev(false, {
                        loader: "thread-loader", // Throw ts-loader into multi-threading to speed things up.
                        options: {
                            workers: cpus.length - 1,
                            poolTimeout: Infinity,
                        },
                    }),
                    {
                        loader: "babel-loader",
                        options:{
                            presets: [
                                "@babel/preset-react"
                            ],
                            plugins: [
                                prodOrDev(false, "babel-plugin-styled-components"),
                                prodOrDev(false, "react-refresh/babel")
                            ].filter(Boolean)
                        }
                    },
                    {
                        loader: "ts-loader",
                        options:{
                            happyPackMode: true,
                            transpileOnly: true
                        }
                    },
                ].filter(Boolean)
            }
        ]
    },
    resolve:{
        alias: aliases,
        extensions: ['.js', '.json', '.ts', '.tsx']
    }
};


const clientConfig: Configuration = Object.assign({}, baseConfig, {
    entry: {
        app: './src/app.tsx'
    },
    output:{
        path: path.join(process.cwd(), './docs'),
        library: {
            name: 'unm2-tangram',
            type: 'umd'
        },
        filename: prodOrDev('[chunkhash].[fullhash].js', '[name].js'),
        chunkFilename: prodOrDev('[chunkhash].[fullhash].js', '[name].js'),
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
    },
    devtool: "source-map",
    devServer: prodOrDev(undefined, {
        hot: true,
        host: '0.0.0.0',
        port: 8085
    }),
    optimization:{
        
    },
    plugins: [
        new TsCheckerPlugin({
            async: prodOrDev(false, true), // Only report after a run, freeing the process to work faster
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
                build: prodOrDev(true, false), // Build mode speeds up consequential builds (evertyhing after the first build, based on the prior build)
                configFile: path.resolve(__dirname, "tsconfig.json"),
                mode: "write-tsbuildinfo",
                profile: prodOrDev(false, true), // Don't slow down production by profiling, only in development do we need this information.
            },
        }),
        new CleanWebpackPlugin({
            dry: process.env.NODE_ENV === 'development'
        }),
        new HtmlWebPackPlugin({
            title: 'Tangram Game',
            filename: 'index.html',
            template: './src/app.ejs',
            xhtml: true
        }),
        new webpack.DefinePlugin({
            PKG_VRS: JSON.stringify(require("./package.json").version)
        }),
        prodOrDev(false, new webpack.HotModuleReplacementPlugin()),
        prodOrDev(false, new ReactRefreshWebpackPlugin()),
        !!process.env.ANALYZE_BUNDLE && new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: path.resolve(__dirname, 'server-report.html')
        })
    ].filter(Boolean)
});


export default [clientConfig];
