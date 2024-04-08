import { lazy } from 'react';
import Login from '../pages/login';
const Index = lazy(() => import('../pages/Index'));

const routes = [
    // dashboard
    {
        path: '/',
        element: <Index />,
        layout: 'default',
    },
    {
        path: '/login',
        element: <Login />,
        layout: 'blank',
    }

];

export { routes };
