"use strict";

import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';
import baseConfig from './webpack.config.base';
import { templateParameters } from './tools/webpack-utils';


// [hash] vs [chunkhash] vs [contenthash] > contenthash is best for our use-case
// see https://stackoverflow.com/a/52786672
//     (https://stackoverflow.com/questions/35176489/what-is-the-purpose-of-webpack-hash-and-chunkhash)

export default merge(baseConfig, {

	mode: 'production',

	devtool: 'cheap-source-map', // source-map see https://webpack.js.org/configuration/devtool/#devtool

	entry: {
		index: [
			path.join(__dirname, 'app/index'),
		],
	},

	output: {
		filename: (pathData, assetInfo) => {

			// note: this is currently not needed as it is handled by the InjectManifest plugin
			// Service Worker scripts should always have the same name
			// if (pathData.chunk.name === 'sw') {
			// 	return '[name].js';
			// }

			return '[name].[contenthash].imt.js';

		},
		publicPath: '/',
		// https://github.com/waysact/webpack-subresource-integrity#webpack-configuration-example
		crossOriginLoading: 'anonymous',
	},

	module: {
		rules: [
			{
				test: /\.css?$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					'css-loader',
				],
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			{
				test: /\.s?css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					'css-loader',
					// https://github.com/bholloway/resolve-url-loader/blob/v5/packages/resolve-url-loader/README.md
					'resolve-url-loader',
					// PostCSS options are automatically loaded from postcss.config.js
					'postcss-loader',
					'sass-loader',
				],
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			// note: it seems that to get rid out of the process/browser.js shim
			//       'process': false is also required
			//       maybe it is related to discussion in https://github.com/webpack/webpack/issues/798
			'process': false,
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		// https://github.com/webpack-contrib/mini-css-extract-plugin
		// https://webpack.js.org/plugins/mini-css-extract-plugin/
		new MiniCssExtractPlugin({
			filename: 'style.[contenthash].imt.css',
		}),
		new SubresourceIntegrityPlugin({
			hashFuncNames: ['sha256', 'sha384'],
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
		// minimize: true, // (true by default for production) https://github.com/babel/minify probably does not work (outputs are even bigger)
	},

});
