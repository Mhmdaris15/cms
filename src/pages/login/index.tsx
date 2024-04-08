import { Button } from '@material-tailwind/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    let navigate = useNavigate();
    const handleLogin = () => {
        if (username === 'angkieyudistia' && password === 'angkieyudistia123') {
            window.localStorage.setItem('username', username);
            navigate('/');  
        } else {
            toast.error('Username atau Password Salah');
        }
    };
    React.useEffect(() => {
        const username = window.localStorage.getItem('username');
        if (username === 'angkieyudistia') {
            navigate('/');
        }
    }
    , []);
    
    return (
        <div className="w-screen h-screen bg-[#F5f5f5] flex items-center justify-center">
            <form className="w-[350px] rounded-lg h-[450px] items-center justify-center shadow-lg p-8 bg-[#FFFFFF] flex flex-col gap-2">
                <h1 className="text-2xl font-bold pb-6">Login</h1>
                <div className="space-y-3 w-full">
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="focus:outline-none w-full p-5 px-2 h-[20px] rounded-md border-[1px] border-black/30"
                        placeholder="Masukan Username"
                        type="text"
                    />
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="focus:outline-none w-full p-5 px-2 h-[20px] rounded-md border-[1px] border-black/30"
                        placeholder="Masukan Password"
                        type="password"
                    />
                    <Button onClick={handleLogin} className="w-full">Login</Button>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Login;
