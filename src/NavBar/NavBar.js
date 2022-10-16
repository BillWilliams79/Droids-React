import '../index.css';
import AuthContext from '../Context/AuthContext';
import ProfileDrawer from './ProfileDrawer.js';

import React, {useContext} from 'react';
import { Link } from "react-router-dom"

import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AndroidIcon from '@mui/icons-material/Android';

const NavBar = () => {
    console.count('Navbar render');
    const { idToken } = useContext(AuthContext);

  return (
    <AppBar className="app-navbar" position="static" sx={{backgroundColor: 'maroon', padding: 2,  pb: {xs:2, md:3} }}>
        <Stack direction={{ xs: 'row', md: 'column', }}
               spacing={1}
               alignItems={{xs: 'center', md: 'flex-start'}}
        >
          <AndroidIcon />
          <Link className="nav-title" to="/">
            Droids
          </Link>
              <>
                <Link className="nav-link" to="/droidview"> Visualize</Link>
                {idToken &&
                    <ProfileDrawer/>
                }
              </>
        </Stack>
    </AppBar>
  );
};

export default NavBar;
