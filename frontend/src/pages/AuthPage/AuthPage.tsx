import { useState } from 'react';
import './AuthPage.css';
import { useUser } from '../../stores/User';
import socket from '../../utils/socket';

export default function AuthPage() {
    let [password, setPassword] = useState('');
    let [username, setUsername] = useState('');
    let UserContext = useUser();
    
    const handleLogin = (e:any) => {
        e.preventDefault();
        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.user) {
                //console.log(data.user, socket);
                localStorage.setItem('auth_token', data.user.token);
                if(!socket.connected) {
                    socket.auth = {
                      token: data.user.token
                    }
                    socket.connect();
                }
                
                UserContext.setUser(data.user);
            }
        })
        .catch(err => console.log(err));
    };

    return <>
    <div className="auth-page-raw-inner">
        <div className="auth-page-inner">
            <div className="auth-page-header">
                <h1>
                    Log in
                </h1>
            </div>
            <div className="auth-page-input-container">
                <p>Login: </p>
                <input
                    value={username}
                    placeholder="Enter your login here"
                    onChange={ev => setUsername(ev.target.value)}
                    className={"inputBox"} />
                <label className="errorLabel"></label>
            </div>
            <div className="auth-page-input-container">
                <p>Password: </p>
                <input
                    value={password}
                    placeholder="Enter your password here"
                    onChange={ev => setPassword(ev.target.value)}
                    className={"inputBox"} />
                <label className="errorLabel"></label>
            </div>
            <div className="auth-page-sumbit-btn" onClick={handleLogin}>
                Log in
            </div>
        </div>
    </div>
        
    </>
}