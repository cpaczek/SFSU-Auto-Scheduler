module.exports = {
  lintOnSave: false,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup'
    },
    standalone: {
      template: 'public/browser-extension.html',
      entry: './src/standalone/main.js',
      title: 'Standalone',
      filename: 'index.html'
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js'
            ]
          }
        },
        manifestTransformer: (manifest) => {
          if (process.env.NODE_ENV === 'development') {
            manifest.content_security_policy = manifest.content_security_policy.replace('script-src', 'script-src http://localhost:8098');
          }

          return manifest;
        }
      }
    }
  }
}
