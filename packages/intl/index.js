const {SERVICE} = require('../enum');

/* eslint-disable global-require */
const messages = {
    common: {
        en: require('./messages/common/messages.en'),
    },
    [SERVICE.gmail]: {
        en: require('./messages/gmail/messages.en'),
    },
};
const defaultLocale = 'en';
const defaultType = SERVICE.gmail;

/**
 * Returns translated messages for locale and type
 * @param {string} locale One of 'en', 'ru', and so on.
 * @param {string} type One of 'landing', 'video', 'teasers'.
 * @return {{locale: string, messages: {}}}
 */
function getMessages({locale = defaultLocale, type = defaultType}) {
    type = type in messages ? type : defaultType;
    locale = locale in messages[type] ? locale : defaultLocale;

    return {
        locale,
        type,
        messages: {
            ...messages.common[locale],
            ...messages[type][locale],
        },
    };
}

module.exports = {
    defaultLocale,
    getMessages,
};
