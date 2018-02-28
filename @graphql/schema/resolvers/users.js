import makeResult from '../utils/makeMutationResult';

export default async (root, {query}, {req, res}) => {
    let users = [
        {
            name: 'Suzy Cuningham',
            email: 'suzy.cuningham@gmail.com',
            registerDate: 'Oct 1, 2015',
            date: '1 year ago',
        },
        {
            name: 'Bobby Daniels',
            email: 'boddyD@outlook.com',
            registerDate: 'Oct 1, 2015',
            date: '1 year ago',
        },
        {
            name: 'John Walker',
            email: 'johnyWalker@blue.com',
            registerDate: 'Oct 1, 2015',
            date: '1 year ago',
        },
        {
            name: 'Eddy Stevens',
            email: 'eStevens@yahoo.com',
            registerDate: 'Oct 1, 2015',
            date: '1 year ago',
        },
        {
            name: 'Jan Williams',
            email: 'jDubz@msn.com',
            registerDate: 'Oct 1, 2015',
            date: '1 year ago',
        },
    ];

    if (query) {
        // noinspection JSAnnotator
        users = users.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.email.toLowerCase().includes(query.toLowerCase()));
    }
    return makeResult({data: users});
};
