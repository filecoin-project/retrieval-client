import path from 'path'
import { fileURLToPath } from 'url'

import ESLintPlugin from 'eslint-webpack-plugin'
import { GitRevisionPlugin } from 'git-revision-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

import { SW_NAME, SW_CORE_NAME } from './src/constants.js'

const gitPlugin = new GitRevisionPlugin({
    commithashCommand: 'rev-parse --short HEAD'
})

const __dirname = fileURLToPath(path.dirname(import.meta.url))
const abspath = p => path.resolve(__dirname, p)
const cl = console.log

export default (env, { mode }) => {
    // Switch to .env files once this gets unwieldy
    const IS_PROD = mode === 'production'
    const STATIC_ORIGIN = IS_PROD
        ? 'https://filecoin-saturn.s3.us-west-1.amazonaws.com'
        : 'http://localhost:8030'
    const GATEWAY_ORIGIN = IS_PROD
        ? 'https://cdn.saturn.network'
        : 'http://localhost:8031'

    return {
        // Uncomment snapshot for webpack to detect edits in node_modules/
        snapshot: {
            managedPaths: [],
        },
        entry: {
            widget: abspath('src/widget/widget.js'),
            [SW_NAME]: abspath('src/sw/saturn-sw.js'),
            [SW_CORE_NAME]: abspath('src/sw/sw-core.js'),
        },
        devServer: {
            client: {
                logging: 'warn'
            },
            static: abspath('dist'),
            port: 8030,
            // hot: false,
            // liveReload: false,
            webSocketServer: false
        },
        output: {
            path: abspath('dist'),
            clean: true,
            publicPath: STATIC_ORIGIN + '/',
        },
        plugins: [
            new webpack.EnvironmentPlugin({
                COMMITHASH: JSON.stringify(gitPlugin.commithash()),
                STATIC_ORIGIN,
                GATEWAY_ORIGIN,
            }),
            new ESLintPlugin({
                emitError: false,
                emitWarning: false,
            }),
            new HtmlWebpackPlugin({
                template: abspath('placeholders/index.html'),
                chunks: ['widget']
            })
        ],
        resolve: {
            alias: {
                '@': abspath('src'),
                '@sw': abspath('src/sw'),
                '@widget': abspath('src/widget'),
            }
        }
    }
}
