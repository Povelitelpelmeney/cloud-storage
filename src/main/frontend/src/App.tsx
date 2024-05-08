import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import TokenService from "./services/token-service";
import eventBus from "./common/eventBus";
import AuthService from "./services/auth-service";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Storage from "./components/Storage/Storage";
import "./App.scss";

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  const logout = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };

  useEffect(() => {
    const user = TokenService.getUser();

    if (user) setCurrentUser(user);
    eventBus.on("logout", logout);

    return () => {
      eventBus.remove("logout", logout);
    };
  }, []);

  return (
    <BrowserRouter>
      <header className="header">
        <div className="logo">
          <NavLink to="/" className="nav-link">
            Cloud storage
          </NavLink>
        </div>
        {currentUser ? (
          <ul className="auth">
            <li className="nav-item">
              <NavLink to="/login" className="nav-link" onClick={logout}>
                Logout
              </NavLink>
            </li>
          </ul>
        ) : (
          <ul className="auth">
            <li className="nav-item">
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/signup" className="nav-link">
                Sign up
              </NavLink>
            </li>
          </ul>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/" element={currentUser ? <Storage /> : null} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <footer>All rights reserved &copy;</footer>
    </BrowserRouter>
  );
};

export default App;
