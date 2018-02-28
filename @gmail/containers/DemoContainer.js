import {graphql} from 'react-apollo';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {updateIntl} from 'react-intl-redux';
import Demo from '@gmail/components/demo';
import users from '@graphql/gql/users.gql';

export default compose(
    connect(
        // mapStateToProps
        (state) => ({
            locale: state.getIn(['intl', 'locale']),
            isMobile: state.getIn(['userAgent', 'isMobile']),
            search: state.getIn(['search', 'query']),
        }),
        // mapDispatchToProps
        {
            updateIntl,
        },
    ),
    graphql(users, {
        options: {fetchPolicy: 'network-only'},
        props({data: {users, loading, fetchMore}}) {
            if (users) {
                return {users: users.data, loading, fetchMore};
            } else {
                return {users: [], loading, fetchMore};
            }

        },
    }),
)(Demo);
