import {getMessages} from 'packages/intl';
import {COOKIE, PERIOD} from 'packages/enum';

export default (rootValue, {locale, type}, {res: clientResponse}) => {
    clientResponse.cookie(COOKIE.locale, locale, {
        expires: PERIOD.neverExpires,
    });

    return getMessages({locale, type});
};
