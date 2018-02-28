import cs from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {Toolbox} from 'packages/components';
import style from './styles.less';


export default class Demo extends Component {
    state = {label: ''};

    handleChange = (name, value) => {
        this.setState({...this.state, [name]: value});

        this.props.fetchMore({
            variables: {
                query: value,
            },
            updateQuery(previousResult, {fetchMoreResult}) {
                return fetchMoreResult;
            },
        });
    };

    render() {

        const {users} = this.props;
        return (
            <div className={style.wrapper}>
                <div className={style.leftWrapper}>
                    <Toolbox.AppBar title="Users" className={style.bar} />

                    <Toolbox.List selectable ripple>
                        <Toolbox.ListItem caption="All Users" leftIcon="account_circle" />
                        <Toolbox.ListItem caption="Favorites" leftIcon="star_rate" />
                        <Toolbox.ListItem caption="Administrators" leftIcon="check_circle" />
                        <Toolbox.ListItem caption="Non-Admins" leftIcon="supervisor_account" />
                        <Toolbox.ListItem caption="Archived" leftIcon="inbox" />
                    </Toolbox.List>
                </div>
                <div className={style.rightWrapper}>
                    <Toolbox.AppBar title="All Users" className={style.bar} />

                    <div className={style.table}>
                        <div className={style.input}><Toolbox.Input
                            icon="search"
                            type="text"
                            hint="search"
                            name="name"
                            value={this.state.label}
                            onChange={this.handleChange.bind(this, 'label')}
                        />
                        </div>
                        <div className={style.usersWrapper}>
                            {users ? users.map(item => (<div>
                                <div className={style.divider} />
                                <div className={style.user}>
                                    <div className={style.account}>
                                        <Toolbox.FontIcon value="account_circle" />
                                    </div>
                                    <div className={style.accountDetails}>
                                        <span className={style.name}>{item.name}</span>
                                        <br />
                                        <span className={style.email}>{item.email}</span>
                                    </div>
                                    <div className={style.registerDate}>
                                        <span>{item.registerDate}</span>
                                    </div>
                                    <div className={style.date}>
                                        <span>{item.date}</span>
                                    </div>
                                    <div className={style.settings}>
                                        <Toolbox.FontIcon value="more_vert" />
                                    </div>
                                </div>
                            </div>)) : 'Loading...'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
