const asset = require('./utils/asset');

/**
 * Формирует статичную часть заголовка, не зависящую от адреса страницы.
 * @param {Boolean} initial Признак первого обращения клиента
 * @returns {string}
 */
export const headStatic = ({type, suffix = __PRODUCTION__ ? 'production.min' : 'development'}) => `
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">    
    
    <script src='https://cdn.jsdelivr.net/g/lodash@4(lodash.min.js+lodash.fp.min.js)'></script>
    <script>var lodash_fp = _.noConflict();</script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.23.0/polyfill.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/16.0.0/umd/react.${suffix}.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.0.0/umd/react-dom.${suffix}.js"></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
    <!-- -->
    ${asset({src: '/assets/scripts/vendor.js', defer: true})}
    ${asset({src: `/assets/scripts/${type}.js`, defer: true})}
    ${asset({src: '/assets/themes/theme-ab/theme.css'})}
    ${asset({src: '/assets/styles/vendor.css'})}
    ${asset({src: `/assets/styles/${type}.css`})}
    `;

/**
 * Формирует метаданные заголовка, зависящие от адреса страницы.
 * @param {Object} meta
 */
export const headMeta = (meta = {}) => `
    <title>${meta.title || ''}</title>
    <meta name="description" content="${meta.description || ''}">
    <meta name="keyword" content="${meta.keyword || ''}">
</head>`;

/**
 * Выводит сообщение об ошибке.
 * @param {Error} err
 */
export const renderError = (err) => `<div style="display: none">
    ${JSON.stringify({message: err.message, stack: err.stack}, null, 2)}
</div>`;

/**
 * Формирует body.
 */
export const body = ({content, initialState, apolloState, csrfToken, suffix = __PRODUCTION__}) => `
<body style="margin: 0;">
    <div id="app-root">${content}</div>
    <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(initialState).replace(/</g, '\\u003c')};
        window.__APOLLO_STATE__ = ${JSON.stringify(apolloState).replace(/</g, '\\u003c')};
        window.__CSRF_TOKEN__ = '${csrfToken}';
    </script>
</body>`;
