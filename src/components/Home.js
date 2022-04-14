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
                  <h2>{HomePageText.section2.title}</h2>
                  <p>{HomePageText.section2.abstract}</p>
                  <div>
                    <h3>{HomePageText.section2.subtitle1}</h3>
                    <p>{HomePageText.section2.description1}</p>
                  </div>
                  <div>
                    <p> </p>
                    <h3>{HomePageText.section2.subtitle2}</h3>
                    <p>{HomePageText.section2.description2}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrap-bg">
          <div className="manage-area pt-100">
            <div className="container">
              <div className="section-title">
                <h2>A single dashbaord for your portfolio</h2>
                <p>If you're tired of using five different platforms to track your crypto invetments, then it's time to meet Goosebumps.</p>
              </div>

              <div className="row align-items-center">
                <div className="col-lg-4">
                  <div className="manage-content">
                    <ul>
                      <li>
                        <h3>
                          <img src="./assets/images/index-2/dashboard-icon.png" alt="goosebumps" />
                          One dashboard for all your portfolio needs.
                        </h3>
                        <p>We give you the power to invest in cryptocurrencies with no risk, no hassle, and minimal technical knowledge needed.</p>
                      </li>
                      <li>
                        <h3>
                          <img src="./assets/images/index-2/portfolio-icon.png" alt="goosebumps" />
                          A sense of security that comes easy
                        </h3>
                        <p>We keep your data safe and never let you worry about data breaches or hacks. The best part? You can use the app with peace of mind - it's completely free!
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="manage-img ml-15">
                    <img src="./assets/images/index-2/manage-img.png" alt="goosebumps" />
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="manage-content">
                    <ul>
                      <li>
                        <h3>
                          <img src="./assets/images/index-2/portfolio-icon.png" alt="goosebumps" />
                          A platform that's built just for you
                        </h3>
                        <p>Whether you're a beginner trader or a pro, Goosebumps has tools that are tailored for your needs. Stay on top of all your trades with features like portfolio management, news feed, alerts & more!
                        </p>
                      </li>
                      <li>
                        <h3 className="quick">
                          <img src="./assets/images/index-2/usd-icon.png" alt="goosebumps" />
                          &nbsp;&nbsp;&nbsp;An app that looks great on any screen size
                        </h3>
                        <p>Goosebumps has been designed to take advantage of our modern-day screens - big or small - so you can trade without missing out on any important market updates with our app’s responsiveness.</p>
                      </li>
                    </ul>
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
                    <h2>Get a bird's eye view of your investments</h2>
                    <h5>Using Goosebumps is an easy way to track your assets across different wallets. Watch the prices change in real-time, and get alerts when they change color!</h5>
                    <ul>
                      <li className="d-flex align-items-start">
                        <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                        <h5>Stay on top of your portfolio</h5>
                      </li>
                      <p>Our goal is to give you a single view of your portfolios across multiple, different wallets. Watch the prices change in real time with alerts on when they change color.</p>
                      <li className="d-flex align-items-start">
                        <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                        <h5>Track all your coins at once
                        </h5>
                      </li>
                      <p>Track coins across different wallets that are on different chains. Track the price history of each coin all in one monitor for easy viewing.</p>
                      <li className="d-flex align-items-start">
                        <img src="./assets/images/index-2/check-icon.png" alt="goosebumps" />
                        <h5>No more headaches, no more stress!</h5>
                      </li>
                      <p>Goosebumps Charts takes away the headache of checking multiple wallets for new transactions. Track all of your wallets in one place for less headache and stress!
                      </p>

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
                    <h2>{HomePageText.section6.title}</h2>
                    <p>{HomePageText.section6.abstract}</p>

                    <ul>
                      <li className="d-flex align-items-start align-items-center">
                        <img src="./assets/images/index-2/noti-icon.png" alt="goosebumps" />
                        <h4>{HomePageText.section6.subtitle1}</h4>
                        <p>{HomePageText.section6.description1}</p>
                      </li>
                      {/* <li className="d-flex align-items-start align-items-center">
                        <img src="./assets/images/index-2/src-icon.png" alt="goosebumps" />
                        <p>Each chart will have a trade history just like Poocoin and Bogged charts</p>
                      </li> */}
                      <li className="d-flex align-items-start align-items-center">
                        <img src="./assets/images/index-2/pai-icon.png" alt="goosebumps" />
                        <h4>Indicators for user activity
                        </h4>
                        <p>Don’t get lost and keep track of your trading activity, anytime, anywhere.</p>
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
