import { useEffect } from 'react';
import Form from './Form';

const Index = () => {
    useEffect(() => {
        const username = window.localStorage.getItem('username');
        if (username !== "angkieyudistia") {
            window.location.href = '/login';
        }
    }
    , []);
    return (
        <div>
            <div className="panel">{Form()}</div>
        </div>
    );
};

export default Index;
