import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import HomePageText from '../constants/home.json';
console.log(HomePageText);

export class Home extends Component {
    static displayName = Home.name;

    render() {
        return (
            <>
                <section className="banner-area">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="banner-content">
                                    <h1>Manage Your Crypto and Portfolio From One Place</h1>
                                    <p>Goosebumps powered by Empire Token is a decentralized exchange with a unique portfolio tracking and charting system.</p>
                                    <div className="banner-btn">
                                        <Link to="/portfolio-tracker" className="default-btn">Portfolio Tracker</Link>
                                        <Link to="/charts" className="default-btn">Charts</Link>
                                        <Link to="/stake" className="default-btn">Stake</Link>
                                        <Link to="/dex" className="default-btn">DEX</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 pe-0">
                                <div className="banner-img">
                                    <img src="./assets/images/index-2/banner-img.png" alt="portfolio tracker" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="portfolio-area ptb-100">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <img src="./assets/images/index-2/portfolio.png" alt="portfolio tracker" />
                            </div>
                            <div className="col-lg-6">
                                <div className="portfolio-content">
                                    <h2>The Most Trusted Portfolio Manager Platform</h2>
                                    <p>Manage all your DeFi and crypto from one place – a single wallet to buy, sell, swap, track, and earn on your crypto! Our industry-leading security protocols make Goosebumps Wallet one of the world's most secure crypto and DeFi wallets.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="wrap-bg">
                    <div className="manage-area pt-100">
                        <div className="container">
                            <div className="section-title">
                                <h2>Manage All Your Crypto and DeFi Assets From One Place</h2>
                                <p>Goosebumps supports the most popular cryptocurrency platforms, including Binance, Coinbase, and 400 others.</p>
                            </div>

                            <div className="row align-items-center">
                                <div className="col-lg-4">
                                    <div className="manage-content">
                                        <ul>
                                            <li>
                                                <h3>
                                                    <img src="./assets/images/index-2/dashboard-icon.png" alt="goosebumps" />
															One Dashboard for Everything
										</h3>
                                                <p>Track every asset you have from one dashboard, and stay on top of your game.</p>
                                            </li>
                                            <li>
                                                <h3>
                                                    <img src="./assets/images/index-2/portfolio-icon.png" alt="goosebumps" />
																Seamless Portfolio> Management
										</h3>
                                                <p>Take a look at your total crypto investing picture and start taking steps to improve it.</p>
                                            </li>
                                            <li>
                                                <h3 className="quick">
                                                    <img src="./assets/images/index-2/usd-icon.png" alt="goosebumps" />
																	Quick & Secure
										</h3>
                                                <p>Getting started with Goosebumps only takes a few minutes, and it’s completely free and secure.</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="col-lg-8">
                                    <div className="manage-img ml-15">
                                        <img src="./assets/images/index-2/manage-img.png" alt="goosebumps" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="dex" className="dex-area pt-100">
                        <div className="container">
                            <div className="section-title">
                                <h2>Dex</h2>
                                <p>Goosebumps supports the most popular cryptocurrency platforms, including Binance, Coinbase, and 400 others.</p>
                            </div>

                            <div className="row">
                                <div className="col-lg-3 col-sm-6">
                                    <div className="single-dex">
                                        <img src="./assets/images/index-2/bit-icon.png" alt="goosebumps" />
                                        <h3>Swap and Add Liquidity</h3>
                                        <p>Chart Trading activity Trading indicators Trading history</p>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-sm-6">
                                    <div className="single-dex">
                                        <img src="./assets/images/index-2/rate-icon.png" alt="goosebumps" />
                                        <h3>Cross-chain Swap</h3>
                                        <p>Chart Trading activity Trading indicators Trading history</p>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-sm-6">
                                    <div className="single-dex">
                                        <img src="./assets/images/index-2/lock-icon.png" alt="goosebumps" />
                                        <h3>Staking pools </h3>
                                        <p>A staking pool allows multiple stakeholders to combine their computational resources as a way to increase</p>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-sm-6">
                                    <div className="single-dex">
                                        <img src="./assets/images/index-2/chart-icon.png" alt="goosebumps" />
                                        <h3>Farming pools</h3>
                                        <p>Yield farming works with a liquidity provider and a liquidity pool that powers a DeFi market</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="portfolio-tracker" className="portfolio-tracker-area pt-100">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6">
                                    <div className="portfolio-tracker-img">
                                        <img src="./assets/images/index-2/portfolio-tracker-img.png" alt="goosebumps" />
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="chart-content">
                                        <h2>Charts</h2>

                                        <ul>
                                            <li className="d-flex align-items-start">
                                                <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                                                <p>Tracks the amount of holdings of multiple wallets across multiple chains</p>
                                            </li>
                                            <li className="d-flex align-items-start">
                                                <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                                                <p>Tracks your gains/losses</p>
                                            </li>
                                            <li className="d-flex align-items-start">
                                                <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                                                <p>Alerts system and color coding in numbers to indicate major changes in prices of your holdings across multiple wallets</p>
                                            </li>
                                            <li className="d-flex align-items-start">
                                                <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                                                <p>Single view of a table to showcase a table of tokens tracked across multiple wallets</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="charts" className="chart-area ptb-100">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-5">
                                    <div className="portfolio-tracker-content ml-15">
                                        <h2>Portfolio Tracker</h2>
                                        <p>The portfolio tracker must have its own section with a unique design and the following functionalities</p>

                                        <ul>
                                            <li className="d-flex align-items-start align-items-center">
                                                <img src="./assets/images/index-2/noti-icon.png" alt="goosebumps" />
                                                <p>Has the option to have a single chart or up to 8 charts in one window</p>
                                            </li>
                                            <li className="d-flex align-items-start align-items-center">
                                                <img src="./assets/images/index-2/src-icon.png" alt="goosebumps" />
                                                <p>Each chart will have a trade history just like Poocoin and Bogged charts</p>
                                            </li>
                                            <li className="d-flex align-items-start align-items-center">
                                                <img src="./assets/images/index-2/pai-icon.png" alt="goosebumps" />
                                                <p>Indicators for users’ trading activity</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="col-lg-7">
                                    <div className="chart-img ml-15">
                                        <img src="./assets/images/index-2/chart-img.png" alt="goosebumps" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="partner-area-chim pb-70">
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-4.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-5.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-3.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-1.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-7.png" alt="goosebumps" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-10.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-2.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-6.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-9.png" alt="goosebumps" />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="partner-item">
                                        <img src="./assets/images/partner/partner-8.png" alt="goosebumps" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
