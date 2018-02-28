import MutationResult from '../types/MutationResult';
import usersResolver from '../resolvers/users';
import {GraphQLString} from 'graphql';

export default {
    type: MutationResult,
    description: 'Return users',
    args: {
        query: {type: GraphQLString},
    },
    resolve: usersResolver,
};
