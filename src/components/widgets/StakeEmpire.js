import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
  Accordion,
  Col,
} from "react-bootstrap";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { Contract, Provider } from "ethers-multicall";
import { ConnectButtonModal } from "./ConnectButtonModal";
//import { ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent } from '@pancakeswap-libs/sdk';
//import Web3 from 'web3';
import tokenAbi from "../../abis/token";
import approveToken from "../../abis/approveToken";
import pairAbi from "../../abis/pair";
import stakingToken from "../../abis/stakingToken";
import { InfoSVG } from "./InfoSVG";
import stakingInfo from "../../stakingTokens.json";
import { logMessage } from '../../utils/helpers';

const StakeEmpire = (props) => {
  //adres değiştirmek için token adı yazan butona basınca popup açmamız gerek
  const { account } = useEthers();
  const [init, setInit] = useState(true);
  const [from, setFrom] = useState({
    symbol: props.pair.sellCurrency.symbol,
    address: props.pair.sellCurrency.address,
    decimals: 0,
    amount: "",
    balance: 0,
    origin: "from",
  });
  const [to, setTo] = useState({
    symbol: props.pair.buyCurrency.symbol,
    address: props.pair.buyCurrency.address,
    decimals: 0,
    amount: "",
    balance: 0,
    origin: "to",
  });
  const [price, setPrice] = useState();
  const [earned, setEarned] = useState(0);

  const [message, setMessage] = useState("");

  const [allowance, setAllowance] = useState(0);

  const [balance, setBalance] = useState(0);

  const [loading, setLoading] = useState(false);

  const startLoading = () => {
    setLoading(true);
    let fadeStyle = document.querySelector(".wallet-tabs-h");
    fadeStyle.classList.add("fade-in-wallet-tabs");
  };

  const stopLoading = () => {
    setLoading(false);
    let fadeStyle = document.querySelector(".wallet-tabs-h");
    fadeStyle.classList.remove("fade-in-wallet-tabs");
  };

  const getBalances = useCallback(async () => {
    //normal bnb için farklı bir call yapıyor olabiliriz, deneme fırsatım olmadı.

    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    const ethcallProvider = new Provider(provider);
    await ethcallProvider.init();

    if (account) {
      const sellContract = new Contract(
        props.pair.sellCurrency.address,
        tokenAbi
      );
      const buyContract = new Contract(
        props.pair.buyCurrency.address,
        tokenAbi
      );
      const pairContract = new Contract(
        props.pair.smartContract.address.address,
        pairAbi
      );

      const [sellBalance, sellDecimals, buyBalance, buyDecimals, reserves] =
        await ethcallProvider.all([
          sellContract.balanceOf(account),
          sellContract.decimals(),
          buyContract.balanceOf(account),
          buyContract.decimals(),
          pairContract.getReserves(),
        ]);

      const newFrom = Object.assign({}, from);
      const newTo = Object.assign({}, to);

      newFrom.balance = ethers.utils.formatUnits(sellBalance, sellDecimals);
      newTo.balance = ethers.utils.formatUnits(buyBalance, buyDecimals);

      setFrom(newFrom);
      setTo(newTo);
      setPrice(
        ethers.utils.formatUnits(reserves._reserve1, sellDecimals) /
          ethers.utils.formatUnits(reserves._reserve0, buyDecimals)
      );
    } else {
      const sellContract = new Contract(
        props.pair.sellCurrency.address,
        tokenAbi
      );
      const buyContract = new Contract(
        props.pair.buyCurrency.address,
        tokenAbi
      );
      const pairContract = new Contract(
        props.pair.smartContract.address.address,
        pairAbi
      );

      const [sellDecimals, buyDecimals, reserves] = await ethcallProvider.all([
        sellContract.decimals(),
        buyContract.decimals(),
        pairContract.getReserves(),
      ]);

      const newFrom = Object.assign({}, from);
      const newTo = Object.assign({}, to);

      setFrom(newFrom);
      setTo(newTo);
      setPrice(
        ethers.utils.formatUnits(reserves._reserve1, sellDecimals) /
          ethers.utils.formatUnits(reserves._reserve0, buyDecimals)
      );
    }
  }, [account, from, props.network, props.pair, to]);

  const getAllowance = async (TokenAddress, StakingContract) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const token = new ethers.Contract(
      TokenAddress,
      approveToken,
      provider
    );
    const response = await token.allowance(
      account,
      StakingContract
    );
    const newAllowance = parseFloat(ethers.utils.formatUnits(response, 18));
    if (newAllowance === 0) {
      setMessage("Please Enter Your Allowance Amount");
    }
    if (allowance !== newAllowance) {
      setAllowance(newAllowance);
      setMessage("Please Enter Your Stake Amount");
    }
    logMessage(newAllowance);
  };

  const approve = async (amount, TokenAddress, StakingContract) => {
    startLoading();
    if (amount === "") {
      alert("Please enter a valid amount");
      stopLoading();
      return;
    }
    let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(
      TokenAddress,
      approveToken,
      provider.getSigner()
    );
    try {
      startLoading();
      const tx = await contract.increaseAllowance(
        StakingContract,
        ethers.utils.parseEther(amount)
      );
      const receipt = await tx.wait(tx);
      logMessage("receiptLog: ", receipt);
      if (receipt.status === 1) {
        stopLoading();
        logMessage("Approve Status: Success");
      } else {
        stopLoading();
        console.error(
          "Approve Status: Failed, please check receiptLog message."
        );
      }
    } catch (error) {
      stopLoading();
      logMessage("Error: ", error);
    } finally {
      stopLoading();
      logMessage(
        "The Promise is settled, meaning it has been resolved or rejected."
      );
    }
  };

  const stake = async (amount, StakingContract) => {
    startLoading();
    if (amount === "") {
      alert("Please enter a valid amount");
      stopLoading();
      return;
    }
    let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(
      StakingContract,
      stakingToken,
      provider.getSigner()
    );
    try {
      startLoading();
      const tx = await contract.stake(ethers.utils.parseEther(amount));
      const receipt = await tx.wait(tx);
      logMessage("receiptLog: ", receipt);
      if (receipt.status === 1) {
        stopLoading();
        logMessage("Stake Status: Success");
      } else {
        stopLoading();
        console.error("Stake Status: Failed, please check receiptLog message.");
      }
    } catch (error) {
      stopLoading();
      logMessage("Error: ", error);
    } finally {
      stopLoading();
      logMessage(
        "The Promise is settled, meaning it has been resolved or rejected."
      );
    }
  };

  const getEarned = async (account, StakingContract) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(
      StakingContract,
      stakingToken,
      provider.getSigner()
    );
    const response = await contract.earned(account);
    const earnedLast = ethers.utils.formatEther(response);
    setEarned(earnedLast);
  };

  const withdraw = async (amount, StakingContract) => {
    startLoading();
    if (amount === "") {
      alert("Please enter a valid amount");
      stopLoading();
      return;
    }
    let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(
      StakingContract,
      stakingToken,
      provider.getSigner()
    );
    try {
      startLoading();
      const tx = await contract.withdraw(ethers.utils.parseEther(amount));
      const receipt = await tx.wait(tx);
      logMessage("receiptLog: ", receipt);
      if (receipt.status === 1) {
        stopLoading();
        logMessage("Withdraw Status: Success");
      } else {
        stopLoading();
        console.error(
          "Withdraw Status: Failed, please check receiptLog message."
        );
      }
    } catch (error) {
      stopLoading();
      logMessage("Error: ", error);
    } finally {
      stopLoading();
      logMessage(
        "The Promise is settled, meaning it has been resolved or rejected."
      );
    }
  };

  const getBalanceOf = async (account, StakingContract) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(
      StakingContract,
      stakingToken,
      provider.getSigner()
    );
    const response = await contract.balanceOf(account);
    const balance = ethers.utils.formatEther(response);
    setBalance(balance);
  };

  const withdrawReward = async (StakingContract) => {
    startLoading();
    let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(
      StakingContract,
      stakingToken,
      provider.getSigner()
    );
    try {
      startLoading();
      const tx = await contract.getReward();
      const receipt = await tx.wait(tx);
      logMessage("receiptLog: ", receipt);
      if (receipt.status === 1) {
        stopLoading();
        logMessage("Withdraw Status: Success");
      } else {
        stopLoading();
        console.error(
          "Withdraw Status: Failed, please check receiptLog message."
        );
      }
    } catch (error) {
      stopLoading();
      logMessage("Error: ", error);
    } finally {
      stopLoading();
      logMessage(
        "The Promise is settled, meaning it has been resolved or rejected."
      );
    }
  };

  var arr = [];

  if (account) {
    Object.keys(stakingInfo).forEach(function(key) {
      arr.push(stakingInfo[key]);
    });
    for (let index = 0; index < arr.length; index++) {
      getAllowance(arr[index].TokenAddress, arr[index].StakingContract);
      getEarned(account, arr[index].StakingContract);
      getBalanceOf(account, arr[index].StakingContract);
    }
    //get getbalanceof every 10 seconds
    // reaload a div every 10 seconds
  }

  const fill = (side, value) => {
    if (side === "from") {
      var target = from;
      var setTarget = setFrom;
      var other = to;
      var setOther = setTo;
    } else {
      target = to;
      setTarget = setTo;
      other = from;
      setOther = setFrom;
    }

    const newTarget = Object.assign({}, target);
    newTarget.amount = value;

    var newOther = Object.assign({}, other);
    newOther.amount =
      target.origin === "from" ? (1 / price) * value : price * value;

    setTarget(newTarget);
    setOther(newOther);
  };

  const onAmountChange = (e, side) => {
    fill(side, e.target.value.replace(/[^0-9.]/g, ""));
  };

  useEffect(() => {
    if (init) {
      setInit(false);
      getBalances();
    }
  }, [init, getBalances]);

  return (

    <>
    {arr.map(item => (
      <Accordion className="mb-2">
        <Accordion.Item eventKey="0" className="wallet-tabs wallet-tabs-h">
          <Accordion.Header className="tabs bg-need">
            STAKE {item.Name} - EARN {item.Name}
          </Accordion.Header>
          <Accordion.Body>
            <div className="tab_content">
              <div className="tabs_item">
                {account
                  ? [
                      balance > 0 ? (
                        <div className="exchange d-flex">
                          <div className="w-100" style={{justifyContent:"center", alignItems:"center", display:"flex"}}>
                        <Col xs={5} md={6} className="form-group">
                          <div className="row justify-content-between">
                            <div className="col">
                              <label htmlFor="from" className="w-100">{item.Name} Earned</label>
                            </div>
                          </div>
                          <div className="input-group">
                            <input
                                    id="from"
                                    type="text"
                                    disabled
                                    className="form-control me-2"
                                    placeholder={earned}
                                    autoComplete="off"
                                    min="0"
                                  />
                            <div className="input-group-addon">
                              <Button
                                      className="default-btn mb-2 w-100"
                                      style={{width: "90%"}}
                                      //disabled={loading}
                                      disabled={true}
                                      onClick={() => withdrawReward(item.StakingContract)}
                                    >
                                      {" "}
                                      Withdraw{" "}
                                    </Button>
                            </div>
                          </div>
                        </Col>
                        <Col xs={5} md={6} className="form-group">
                          <div className="row justify-content-between">
                            <div className="col">
                              <label htmlFor="from" className="w-100">{item.Name} Staked</label>
                            </div>
                          </div>
                          <div className="input-group">
                            <input
                                    id="from"
                                    type="text"
                                    disabled
                                    className="form-control me-2"
                                    placeholder={balance}
                                    autoComplete="off"
                                    min="0"
                                  />
                            <div className="input-group-addon">
                              <Button
                                      className="default-btn mb-2 w-100"
                                      style={{width: "90%"}}
                                      //disabled={loading}
                                      disabled={true}
                                      onClick={() => withdraw(balance, item.StakingContract)}
                                    >
                                      {" "}
                                      Withdraw{" "}
                                    </Button>
                            </div>
                          </div>
                        </Col>
                          </div>
                        </div>
                      ) : null,
                    ]
                  : null}
                <div>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="button-tooltip-1">
                        <InfoSVG /> Cannot exceed your allowance amount
                      </Tooltip>
                    }
                  >
                    {({ ref, ...triggerHandler }) => (
                      <Badge
                        {...triggerHandler}
                        className="w-100 mb-3"
                        bg="warning"
                        pill
                        text="dark"
                      >
                        <span ref={ref}>
                          <InfoSVG /> {message} <InfoSVG />
                        </span>
                      </Badge>
                    )}
                  </OverlayTrigger>
                  <div className="form-group">
                    <div className="row justify-content-between">
                      <div className="col">
                        <label htmlFor="from" className="w-100">Amount</label>
                      </div>
                    </div>
                    <div className="input-group">
                      <input
                        id="from"
                        type="text"
                        className="form-control me-2"
                        placeholder="0"
                        autoComplete="off"
                        onChange={(e) => onAmountChange(e, "from")}
                        min="0"
                        max={from.balance}
                        value={from.amount}
                      />
                      <div className="input-group-addon">
                        {account ? (
                        [
                          allowance > 0 ? (
                            <Button
                              className="default-btn w-100 mb-2"
                                      //disabled={loading}
                                      disabled={true}
                              onClick={() => stake(from.amount, item.StakingContract)}
                            >
                              {" "}
                              Stake
                            </Button>
                          ) : (
                            <Button
                              className="default-btn w-100 mb-2"
                                      //disabled={loading}
                                      disabled={true}
                              onClick={() => approve(from.amount, item.TokenAddress, item.StakingContract)}
                            >
                              {" "}
                              Approve
                            </Button>
                          ),
                        ]
                      ) : (
                        <ConnectButtonModal />
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    ))}
    </>
  );
};

export { StakeEmpire };
