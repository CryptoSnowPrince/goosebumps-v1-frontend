import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, NavItem } from "react-bootstrap";
import { ConnectButton } from './widgets/ConnectButton';
import networks from '../networks.json';
import { Requester } from "./../requester";
import { ComingSoonModal } from './widgets/ComingSoonModal';
import { GoogleLogin } from 'react-google-login';
import GoogleProfile from './widgets/GoogleProfile';
import * as selector from '../store/selectors';
import * as action from '../store/actions';
import * as state from '../store/reducers/selChain';

const NavMenu = () => {
    const dispatch = useDispatch();
    // const networkSelector = useSelector(selector.chainState);

    // useEffect(() => {
    //     console.log("networkSelector: ", networkSelector);
    // }, [networkSelector])

    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState({
        email: '',
        name: '',
        imageUrl: ''
    });

    const loginSuccess = (response) => {
        console.log(response);
        setUser({
            email: response?.profileObj.email,
            name: response?.profileObj.name,
            imageUrl: response?.profileObj.imageUrl
        });
        setAuthenticated(true);
    }

    const loginFail = (response) => {
        console.log(response);
    }

    const [show, setShow] = useState();
    const [networkIndex, setNetworkIndex] = useState(localStorage.getItem("networkIndex") || 2);
    const [networkName, setNetworkName] = useState(networks[networkIndex].Name);
    const [networkInfo, setNetworkInfo] = useState(state.defaultState);
    const navigate = useNavigate();
    const searchInput = useRef();

    useEffect(() => {
        // console.log("networkInfo effect: ", networkInfo)
        dispatch(action.setChain(networkInfo));

        // console.log("network effect: ", network)
        // localStorage.setItem("networkIndex", networkIndex);
        // console.log("networkIndex: ", networkIndex);
        // console.log("networkName: ", networkName);
        // console.log("networks: ", networks[2]);
        // console.log("store network: ", network);
        // console.log("networkInfo: ", networkInfo);
        // console.log("networks[networkIndex].Name: ", networks[networkIndex].Name);
    }, [networkInfo]);

    useEffect(() => {
        localStorage.setItem("networkIndex", networkIndex);
        setNetworkName(networks[networkIndex].Name);
        setNetworkInfo({
            chain: {
                index: networkIndex,
                network: networks[networkIndex].Name,
                chainId: networks[networkIndex].chainId,
                chainHexId: networks[networkIndex].chainHexId
            }
        })
    }, [networkIndex]);


    const inPortfolio = window.location.pathname.match("^/portfolio-tracker/" + networkName + "/.");

    const handleSearch = async () => {
        const isToken = await Requester.getAsync("api/Search/IsToken", { address: searchInput.current.value, network: networkName });
        if (isToken) {
            navigate(`/charts/${networkName}/${searchInput.current.value}`);
        }
        else {
            if (inPortfolio) {
                navigate(window.location.pathname + "," + searchInput.current.value);
            }
            else {
                navigate(`/portfolio-tracker/${networkName}/${searchInput.current.value}`);
            }
        }
        searchInput.current.value = "";
    }

    return (
        <>
            <Navbar variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand className='col-auto me-2 me-xl-1'>
                        <Link to="/">
                            <img src="./assets/images/logo.png" alt="Logo" />
                        </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav">
                        <i className="fa fa-bars" />
                    </Navbar.Toggle>
                    <div className="src-form mt-3 mt-lg-0">
                        <div className="network">
                            <i className="fa fa-chevron-down"></i>
                            <select
                                className="form-select"
                                onChange={(e) => {
                                    setNetworkIndex(e.target.value)
                                }}
                                defaultValue={networkIndex}>
                                {networks.map(
                                    (network, index) =>
                                        <option key={index} value={index}>{network.Display}</option>
                                )}
                            </select>
                        </div>
                        <input onSubmit={handleSearch} ref={searchInput} type="text" className="form-control" placeholder={inPortfolio ? "Enter another wallet to track together" : "Enter token or wallet address..."} />
                        <button className="src-btn" onClick={handleSearch}>
                            <i className="fa fa-search" />
                        </button>
                    </div>
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end text-nowrap">
                        <Nav className="mt-3 mt-lg-0">
                            <NavItem>
                                <Link className="nav-link mx-lg-2 mx-xl-3" to="/">Home</Link>
                            </NavItem>
                            <NavItem>
                                <Link className="nav-link mx-lg-2 mx-xl-3" to="/portfolio-tracker">Portfolio Tracker</Link>
                            </NavItem>
                            <NavItem>
                                <Link className="nav-link mx-lg-2 mx-xl-3" to="/charts">Charts</Link>
                            </NavItem>
                            <NavItem>
                                <Link className="nav-link mx-lg-2 mx-xl-3" to="/stake">Stake</Link>
                                {/* <span className="nav-link mx-lg-2 mx-xl-4" onClick={() => setShow(true)}>Stake</span>
                                <ComingSoonModal show={show} hide={() => setShow()} /> */}
                            </NavItem>
                            <NavItem>
                                <Link className="nav-link mx-lg-2 mx-xl-3" to="/dex">DEX</Link>
                            </NavItem>
                            <NavItem>
                                <Link className="nav-link mx-lg-2 mx-xl-3" to="/bridge">Bridge</Link>
                            </NavItem>
                        </Nav>
                        <Navbar.Text className='ms-lg-2 ms-xl-4'>
                            {
                                //authenticated ?
                                //    <GoogleProfile userData={user} setAuthenticated={setAuthenticated} />
                                //    :
                                //    <GoogleLogin
                                //        clientId="384033754919-mc7jfvmrl4jh6jahmnrtf273nh83uk10.apps.googleusercontent.com"
                                //        buttonText="Login with Google"
                                //        onSuccess={loginSuccess}
                                //        onFailure={loginFail}
                                //        cookiePolicy={'single_host_origin'}
                                //        isSignedIn={true}
                                //    />
                            }
                            <ConnectButton />
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export { NavMenu };