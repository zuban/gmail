import {GraphQLNonNull} from 'graphql';

import ServiceEnum from '../types/Service';
import LocaleEnum from '../types/Locale';
import IntlMessagesType from '../types/IntlMessages';
import switchLocaleResolver from '../resolvers/switchLocale';

export default {
    type: IntlMessagesType,
    description: 'Returns locale and messages for internalization',
    args: {
        locale: {type: new GraphQLNonNull(LocaleEnum)},
        type: {type: new GraphQLNonNull(ServiceEnum)},
    },
    resolve: switchLocaleResolver,
};
