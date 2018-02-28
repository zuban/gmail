import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {renderRoutes} from 'react-router-config';
import Header from 'packages/components/header';
import Footer from 'packages/components/footer';

import style from './home.less';
@withRouter
export default class Home extends Component {
    static propTypes = {
        route: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
    };

    static contextTypes = {
        userAgent: PropTypes.object.isRequired,
        intl: PropTypes.object.isRequired,
    };

    render() {
        const {userAgent: {isMobile}, intl} = this.context;
        const {route} = this.props;
        return (
            <div className={style.container}>
                <Header />
                {renderRoutes(route.routes)}
                <Footer />
            </div>
        );
    }
}
