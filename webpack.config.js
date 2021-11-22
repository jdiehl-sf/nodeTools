const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'public/js'),
		filename: 'app.bundle.js',
	},
	devtool: 'source-map',
	watch: true,
	devServer:{
        contentBase: 'public'
    },
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
	plugins: [new MiniCssExtractPlugin()],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
					  presets: ['@babel/preset-env']
					}
				}
			}, {
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					'css-loader',
					 {
						loader: 'resolve-url-loader',
						options: {
							sourceMap: true
						}
					}, {
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						}
					}
				]
			}, {
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader?url=false'],
			}, {
				test: /\.(svg|gif|jpe?g|png)$/,
				use: 'url-loader?limit=10000'
			}, {
				test: /\.(eot|woff|woff2|ttf)$/,
				use: 'url-loader?limit=30&name=assets/fonts/webfonts/[name].[ext]'
			}
		]
	},
	devServer: {
		historyApiFallback: true,
	}
};