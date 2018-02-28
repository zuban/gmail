import {GraphQLEnumType} from 'graphql';
import {SERVICE} from '../../../packages/enum';

export default new GraphQLEnumType({
    name: 'ServiceEnum',
    description: 'Service name',
    values: {
        [SERVICE.gmail]: {},
    },
});
