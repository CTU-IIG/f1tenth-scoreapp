"use strict";

import webpack from 'webpack';
import { merge } from 'webpack-merge';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import baseConfig from './webpack.config.base';
import { templateParameters } from './tools/webpack-utils';


const port = 3000;
const publicPath = `http://localhost:${port}/`;

export default merge(baseConfig, {

	mode: 'development',

	devtool: 'eval-source-map', // see https://webpack.js.org/configuration/devtool/#devtool

	entry: {
		index: [
			// injected automatically by the webpack-dev-server (see devServer.hot/client)
			// `webpack-dev-server/client?http://localhost:${port}/`,
			// 'webpack/hot/only-dev-server',
			path.join(__dirname, 'app/index'),
		],
	},

	output: {
		publicPath,
	},

	module: {
		rules: [
			{
				test: /\.css?$/,
				use: [
					'style-loader',
					'css-loader',
				],
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					// https://github.com/bholloway/resolve-url-loader/blob/v5/packages/resolve-url-loader/README.md
					'resolve-url-loader',
					'sass-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								parser: 'postcss-scss',
								plugins: function () {
									return [autoprefixer];
								},
							},
						},
					},
				],
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
		],
	},

	// https://github.com/gaearon/react-hot-loader#react--dom
	// it is really needed, otherwise React Apollo won't trigger rerenders on proxy changes
	resolve: {
		alias: {
			'react-dom': '@hot-loader/react-dom',
		},
	},

	plugins: [
		new webpack.LoaderOptionsPlugin({
			debug: true,
		}),
		// automatically injected by the webpack-dev-server (when devServer.hot is true or 'only'))
		// new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			__DEV__: true,
			// note: it seems that to get rid out of the process/browser.js shim
			//       'process': false is also required
			//       maybe it is related to discussion in https://github.com/webpack/webpack/issues/798
			'process': false,
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './app/template.ejs',
			templateParameters,
			chunks: ['index'],
			xhtml: true,
		}),
	],

	optimization: {
		emitOnErrors: false,
	},

	devServer: {

		// currently, we use v4.x
		// see the docs at https://webpack.js.org/configuration/dev-server/

		// host: '0.0.0.0',
		port,

		hot: 'only',
		client: {
			// see https://webpack.js.org/configuration/dev-server/#devserverclient
			overlay: {
				errors: true,
				warnings: false,
			},
			webSocketURL: 'auto://0.0.0.0:0/ws',
		},

		historyApiFallback: true,
		static: [
			{
				directory: path.join(__dirname, 'data'),
				publicPath: '/data/',
				// https://github.com/expressjs/serve-index
				serveIndex: false,
				watch: false,
			},
		],

		// currently, not needed
		// headers: {
		// 	'Access-Control-Allow-Origin': '*',
		// },

		// unnecessary
		// devMiddleware: {
		// 	publicPath,
		// },

	},

});
