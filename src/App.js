import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { PortfolioTracker } from './components/PortfolioTracker';
import { Charts } from './components/Charts';
import { DEX } from './pages/DEX/DEX';
// import { Stake } from './components/Stake';
import { Staking } from './pages/Staking/Staking';
import { Liquidity } from './pages/Liquidity/Liquidity';
import { LiquidityAdd } from './pages/LiquidityAdd/LiquidityAdd';
import { LiquidityRemove } from './pages/LiquidityRemove/LiquidityRemove';
import { LiquidityFindToken } from './pages/LiquidityFindToken/LiquidityFindToken';
import { Farming } from './pages/Farming/Farming';
import { Bridge } from './pages/Bridge/Bridge';
import { Connect } from './components/widgets/connectWallet';

import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  useEffect(() => {
    const WrappedConnect = async () => {
      await Connect();
    }
    WrappedConnect();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route exact path='/' element={<Home />} />
        {/* <Route exact path='/stake' element={<Staking />} />
        <Route exact path='/liquidity' element={<Liquidity />} />
        <Route exact path='/liquidityAdd' element={<LiquidityAdd />} />
        <Route exact path='/liquidityRemove' element={<LiquidityRemove />}>
          <Route path='/liquidityRemove/:lpAddress' element={<LiquidityRemove />} />
        </Route>
        <Route exact path='/liquidityFindToken' element={<LiquidityFindToken />} />
        <Route exact path='/farms' element={<Farming />} />
        <Route exact path='/bridge' element={<Bridge />} /> */}
        
        <Route exact path='/stake' element={<Home />} />
        <Route exact path='/liquidity' element={<Home />} />
        <Route exact path='/liquidityAdd' element={<Home />} />
        <Route exact path='/liquidityRemove' element={<Home />}>
          <Route path='/liquidityRemove/:lpAddress' element={<Home />} />
        </Route>
        <Route exact path='/liquidityFindToken' element={<Home />} />
        <Route exact path='/farms' element={<Home />} />
        <Route exact path='/bridge' element={<Home />} />

        <Route path='/portfolio-tracker' element={<PortfolioTracker />}>
          <Route path='/portfolio-tracker/:networkName/:addresses' element={<PortfolioTracker />} />
        </Route>
        <Route path='/charts' element={<Charts />}>
          <Route path='/charts/:networkName/:address' element={<Charts />}>
            <Route path='/charts/:networkName/:address/:pairAddress' element={<Charts />} />
          </Route>
        </Route>
        {/* <Route path='/dex' element={<DEX />} /> */}
        <Route path='/dex' element={<Home />} />
      </Routes>
    </Layout>
  )
}

export default App;