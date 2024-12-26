import CopyPlugin from "copy-webpack-plugin";

export const plugins = [
    new CopyPlugin({
        patterns: [
            { from: "assets", to: "assets", noErrorOnMissing: true },
        ],
    }),
];