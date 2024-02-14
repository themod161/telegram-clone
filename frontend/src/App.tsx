import React, { useState } from 'react';
import socket from './utils/socket';
import Providers from './stores/Providers';
import { useUser } from './stores/User';
import AuthPage from './pages/AuthPage/AuthPage';
import MainPage from './pages/MainPage/MainPage';

function App() {
    let user = useUser();
    return (
        <>
            {
                user.user 
                ? <MainPage /> 
                : <AuthPage />
            }
        </>
    );
}
/*
{
            user.user 
            ? <h1>Hello, {user.user.username}</h1> 
            : <AuthPage />
            } */
export default App;
