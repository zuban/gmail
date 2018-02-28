import DemoContainer from '@gmail/containers/DemoContainer';
import Home from './components/Home';

export default [{
    path: '/',
    component: Home,
    routes: [
        {
            path: '/',
            component: DemoContainer,
            exact: true,
        },
    ],
}];
