import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // `null` means not logged in

    useEffect(() => {
        // Check if a token is saved in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ token }); // Simulate a logged-in user with the token
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setUser({ token });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
