import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { logMessage } from '../../utils/helpers';

const GoogleProfile = ({ userData, setAuthenticated }) => {
    return (
        <div>
            <p>Hello {userData?.name}</p>
            <GoogleLogout
                clientId="384033754919-mc7jfvmrl4jh6jahmnrtf273nh83uk10.apps.googleusercontent.com"
                buttonText="Logout"
                onLogoutSuccess={() => setAuthenticated(false)}
                onLogoutFailure={(res) => logMessage(res)}
            />
        </div>
    );
}

export default GoogleProfile;