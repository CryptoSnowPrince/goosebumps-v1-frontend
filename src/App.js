import React, { Component } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { PortfolioTracker } from './components/PortfolioTracker';
import { Charts } from './components/Charts';
import { DEX } from './components/DEX';
import { Stake } from './components/Stake';

import 'bootstrap/dist/css/bootstrap.min.css';


export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Routes>
                    <Route exact path='/' element={<Home />} />
                    <Route exact path='/stake' element={<Stake />} />
                    <Route path='/portfolio-tracker' element={<PortfolioTracker />}>
                        <Route path='/portfolio-tracker/:networkName/:addresses' element={<PortfolioTracker />} />
                    </Route>
                    <Route path='/charts' element={<Charts />}>
                        <Route path='/charts/:networkName/:address' element={<Charts />}>
                            <Route path='/charts/:networkName/:address/:pairAddress' element={<Charts />} />
                        </Route>
                    </Route>
                    <Route path='/dex' element={<DEX />} />
                </Routes>
            </Layout>
        );
    }
}
