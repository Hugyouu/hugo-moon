import CopyWebpackPlugin from 'copy-webpack-plugin';
import { resolve } from 'path';

export const plugins = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: resolve(__dirname, 'assets'), // Chemin de vos fichiers statiques
                to: 'assets', // Destination dans /dist
            },
        ],
    }),
];
