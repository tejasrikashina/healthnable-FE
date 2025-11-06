const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

    name: 'healthnable-foundation-app',

    exposes: {
        './Component': './projects/healthnable-foundation-app/src/app/app.component.ts',
    },

    shared: {
        'ngx-bootstrap': { singleton: true },
        'bootstrap': { singleton: true },
        '@angular/core': { singleton: true, eager: true },
        '@angular/common': { singleton: true, eager: true },
        '@angular/router': { singleton: true, eager: true },
        ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },

});