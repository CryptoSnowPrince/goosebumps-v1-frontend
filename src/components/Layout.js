import React from 'react';
import { NavMenu } from './NavMenu';

const Layout = (props) => {
    return (
        <>
            <NavMenu />
            <div id="contents">
                {props.children}
            </div>
            <div className="footer-area pt-100">
                <div className="container">
                    <div className="row">
                        <div className="col-md-5">
                            <div className="single-footer-widget">
                                <img src="./assets/images/logo.png?ver=2" alt="Goosebumps" />

                                <p>Goosebumps powered by Empire Token is a decentralized exchange with a unique portfolio tracking and charting system.</p>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="single-footer-widget">
                                <h3>Follow Us</h3>

                                <ul className="socil-link">
                                    <li>
                                        <a href="https://www.instagram.com/empiretoken/" target="_blank" rel="noopener noreferrer">
                                            <i className="fa fa-instagram"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://twitter.com/RealEmpireToken" target="_blank" rel="noopener noreferrer">
                                            <i className="fa fa-twitter"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://t.me/empiretokenworld" target="_blank" rel="noopener noreferrer">
                                            <i className="fa fa-telegram"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.youtube.com/channel/UCYSHk8YsR1jxNR64ezx6q3Q" target="_blank" rel="noopener noreferrer">
                                            <i className="fa fa-youtube"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <p className="text-warning">partnership with</p>
                            <a href="https://empiretoken.world" target="_blank" rel="noopener noreferrer" className="empiretoken">empiretoken.world</a>
                        </div>
                    </div>
                </div>

                <div className="copy-right-area pt-70">
                    <div className="container">
                        <div className="copy-right-wrap">
                            <div className="text-center">
                                <p>© 2021 Goosebumps . All Rights Reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export { Layout }