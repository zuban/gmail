import {GraphQLSchema, GraphQLObjectType} from 'graphql';

// Queries
import users from './queries/users';

// Mutations
import switchLocale from './mutations/switchLocale';

const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root Query for GraphQL api',
    fields: () => ({
        users,
    }),
});

const RootMutationType = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: () => ({
        switchLocale,
    }),
});

export default new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
});
