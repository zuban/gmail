import {GraphQLEnumType} from 'graphql';

export default new GraphQLEnumType({
    name: 'LocaleEnum',
    description: 'Locale for internalization',
    values: {
        en: {},
    },
});
