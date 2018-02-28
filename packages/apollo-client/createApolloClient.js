import {InMemoryCache} from 'apollo-cache-inmemory';
import {setContext} from 'apollo-link-context';
import {createHttpLink} from 'apollo-link-http';
import {ApolloClient} from 'apollo-client';
import isBrowser from 'packages/utils/isBrowser';
import {HEADER} from 'packages/enum';

/**
 * Create Apollo client for server and client usage.
 * @param {Cookies} cookies Instance of Cookies from react-cookie.
 * @param {Map} [apolloState] Used on client to hydrate Apollo state.
 * @return {ApolloClient}
 */
export default ({apolloState}) => {
    let csrfToken = '';
    let uri;

    if (__BROWSER__) {
        csrfToken = window.__CSRF_TOKEN__;
        uri = `${window.location.origin}/graphql/`;
    }
    if (__NODE__) {
        uri = __PRODUCTION__ ?
            'http://gmail-graphql:3090/fromProtectedNetwork' :
            'http://0.0.0.0:3090/fromProtectedNetwork';
    }

    let authLink = setContext(() => ({
        headers: {
            [HEADER.csrf]: csrfToken,
        },
    }));

    const httpLink = createHttpLink({uri, credentials: 'same-origin'});
    const cache = new InMemoryCache();

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: cache.restore(apolloState),
        ssrMode: !isBrowser,
    });
};
