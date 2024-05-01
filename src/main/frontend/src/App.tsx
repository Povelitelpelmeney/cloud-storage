import React from "react";
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import * as AuthService from "./services/auth-service";
import IUser from "./types/user-type";
import LoadButton from "./components/loadButton/loadButton";
import Login from "./components/login-component";
import Register from "./components/register-component";
import Home from "./components/home";
import Profile from "./components/profile-component";
import BoardUser from "./components/boardUser/boardUser";
import BoardAdmin from "./components/boardAdmin/boardAdmin";
import EventBus from "./common/eventBus";

// function App(props: string): JSX.Element {
//   return (
//     <div className="wrapper">
//       <Header />
//       <Footer />
//       <Display />
//     </div>
//   );
// }
const App: React.FC = () => {
  const [showAdminBoard, setShowAdminBoard] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      setShowAdminBoard(user.roles.includes("ROLE_ADMIN"));
    }

    EventBus.on("logout", logOut);

    return () => {
      EventBus.remove("logout", logOut);
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <div className="wrapper">
      <header>
        <span className="logo">
          {" "}
          <NavLink to="/" className="Nav_link">
            Cloud storage
          </NavLink>
        </span>
        <ul className="navigation">
          {/* <li className="nav-item">
            <NavLink to="/home" className="Nav_link">
              Home
            </NavLink>
          </li> */}
          {showAdminBoard && (
            <li className="nav-item">
              <NavLink to="/admin" className="Nav_link">
                Admin Board
              </NavLink>
            </li>
          )}

          {currentUser && (
            <li className="nav-item">
              <NavLink to="/user" className="Nav_link">
                User
              </NavLink>
            </li>
          )}
        </ul>

        {currentUser ? (
          <ul className="logins">
            <li className="nav-item">
              <NavLink to="/profile" className="Nav_link">
                {currentUser.username}
              </NavLink>
            </li>
            <li className="nav-item">
              <a href="/login" className="Nav_link" onClick={logOut}>
                LogOut
              </a>
            </li>
          </ul>
        ) : (
          <ul className="logins">
            <li className="nav-item">
              <NavLink to="/login" className="Nav_link">
                Login
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/register" className="Nav_link">
                Sign Up
              </NavLink>
            </li>
          </ul>
        )}
      </header>
      <div className="container"></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user" element={<BoardUser />} />
        <Route path="/admin" element={<BoardAdmin />} />
      </Routes>
      <div className="presentation"></div>
      <div><LoadButton /></div>
      <footer>All right reserved &copy;</footer>;
    </div>
  );
};
export default App;
