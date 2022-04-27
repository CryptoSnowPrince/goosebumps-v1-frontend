import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, NavItem } from "react-bootstrap";
import { providers/*, ethers*/ } from "ethers";
import { ConnectButtonModal } from './widgets/ConnectButtonModal';
import { Reconnect, Connect, Disconnect } from '../components/widgets/connectWallet'
import networks from '../networks.json';
import { Requester } from "./../requester";
import * as action from '../store/actions';
import * as selector from '../store/selectors'
// import { ComingSoonModal } from './widgets/ComingSoonModal';
// import { GoogleLogin } from 'react-google-login';
// import GoogleProfile from './widgets/GoogleProfile';

const NavMenu = () => {
    const { pathname } = useLocation();
    const dispatch = useDispatch();
    const provider = useSelector(selector.providerState);

    // const [authenticated, setAuthenticated] = useState(false);
    // const [user, setUser] = useState({
    //     email: '',
    //     name: '',
    //     imageUrl: ''
    // });

    // const loginSuccess = (response) => {
    //     console.log(response);
    //     setUser({
    //         email: response?.profileObj.email,
    //         name: response?.profileObj.name,
    //         imageUrl: response?.profileObj.imageUrl
    //     });
    //     setAuthenticated(true);
    // }

    // const loginFail = (response) => {
    //     console.log(response);
    // }

    // const [show, setShow] = useState();
    const [networkIndex, setNetworkIndex] = useState(localStorage.getItem("networkIndex") || 2);
    const [networkName, setNetworkName] = useState(networks[networkIndex].Name);
    const navigate = useNavigate();
    const searchInput = useRef();

    // const getChainId = async () => {
    //     const chainId = (await new providers.Web3Provider(provider).getNetwork()).chainId;
    //     return chainId;
    // }

    const switchChainRequest = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: networks[networkIndex].chainHexId }], // chainId must be in hexadecimal numbers
            });
        } catch (error) {
            console.log("network switching error: ", error);
        }
    }

    useEffect(() => {
        localStorage.setItem("networkIndex", networkIndex);
        dispatch(action.setChainIndex(networkIndex));
        setNetworkName(networks[networkIndex].Name);
    }, [dispatch, networkIndex]);

    useEffect(() => {
        // console.log("provider useEffect")
        try {
            if (provider) {
                const handleAccountsChanged = (accounts) => {
                    // console.log("handleAccountsChanged");
                    Connect();
                    dispatch(action.setAccount(accounts[0]));
                };

                // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
                const handleChainChanged = (_hexChainId) => {
                    console.log("handleChainChanged ")
                    window.location.reload();
                    // console.log("handleChainChanged");
                    // if (parseInt(_hexChainId, 16) !== networks[networkIndex].chainId) {
                        // alert(`Reconnect Change network to ${networks[networkIndex].Display}!`);

                    //     if (window.ethereum) {
                    //         // check if the chain to connect to is installed
                    //         switchChainRequest();
                    //     } else {
                    //         console.log(
                    //             "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
                    //         );
                    //     }
                    // }
                };

                provider.on("accountsChanged", handleAccountsChanged);
                provider.on("chainChanged", handleChainChanged);

                // Subscription Cleanup
                return () => {
                    if (provider.removeListener) {
                        provider.removeListener("accountsChanged", handleAccountsChanged);
                        provider.removeListener("chainChanged", handleChainChanged);
                    }
                };
            }
        } catch (error) {
            console.log("auto connect with provider change err: ", error)
        }
    }, [provider]);

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

    const handleSelectChain = async (event) => {
        setNetworkIndex(event.target.value)
        Reconnect(event.target.value);
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
                                onChange={handleSelectChain}
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
                                <Link
                                    className={`nav-link mx-lg-2 mx-xl-3 
                                    ${pathname === '/' ? "active" : ""}`} to="/">Home</Link>
                            </NavItem>
                            <NavItem>
                                <Link
                                    className={`nav-link mx-lg-2 mx-xl-3 
                                    ${pathname === '/portfolio-tracker' ? "active" : ""}`} to="/portfolio-tracker">Portfolio Tracker</Link>
                            </NavItem>
                            <NavItem>
                                <Link
                                    className={`nav-link mx-lg-2 mx-xl-3 
                                    ${pathname === '/charts' ? "active" : ""}`} to="/charts">Charts</Link>
                            </NavItem>
                            <NavItem>
                                <Link
                                    className={`nav-link mx-lg-2 mx-xl-3 
                                    ${(pathname === '/stake' || pathname === '/farms') ? "active" : ""}`} to="/stake">Stake</Link>
                                {/* <span className="nav-link mx-lg-2 mx-xl-4" onClick={() => setShow(true)}>Stake</span>
                                <ComingSoonModal show={show} hide={() => setShow()} /> */}
                            </NavItem>
                            <NavItem>
                                <Link
                                    className={`nav-link mx-lg-2 mx-xl-3 
                                    ${(
                                            pathname === '/dex' ||
                                            pathname === '/liquidity' ||
                                            pathname === '/liquidityAdd' ||
                                            pathname === '/liquidityRemove' ||
                                            pathname === '/liquidityFindToken'
                                        ) ? "active" : ""}`} to="/dex">DEX</Link>
                            </NavItem>
                            <NavItem>
                                <Link
                                    className={`nav-link mx-lg-2 mx-xl-3 
                                    ${pathname === '/bridge' ? "active" : ""}`} to="/bridge">Bridge</Link>
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
                            <ConnectButtonModal />
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export { NavMenu };