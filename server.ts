import ccxt from "ccxt";
import dotenv from "dotenv";
dotenv.config();
// env variables

console.log("Bybit API Key:", process.env.BYBIT_API_KEY);
const BYBIT_API_KEY = process.env.BYBIT_API_KEY;
const BYBIT_SECRET = process.env.BYBIT_API_SECRET;

// bybit exchange instance
const Bybit = new ccxt.bybit({
  apiKey: BYBIT_API_KEY,
  secret: BYBIT_SECRET,
});
// enable sandbox mode or testnet
Bybit.setSandboxMode(true);

const getBalance = async () => {
  try {
    const balance = await Bybit.fetchBalance();
    return balance;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTickerInfo = async (ticker: string) => {
  try {
    const tickerInfo = await Bybit.fetchTicker(ticker);
    return tickerInfo;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const createCustomEthOrder = async () => {
  try {
    const EthTickerInfo = await Bybit.fetchTicker("ETH/USDT");
    if (!EthTickerInfo) throw new Error("Failed to fetch ETH ticker info");
    const EthLTP = EthTickerInfo.last;
    console.log("ETH LTP:", EthLTP);
    if (!EthLTP) throw new Error("Failed to fetch ETH LTP");
    const order_price = EthLTP * 0.99; // 0.99 i.e 99 % of LTP or 1% less than LTP
    console.log("Order Price:", order_price);
    const order = await Bybit.createOrder(
      "ETH/USDT",
      "limit",
      "buy",
      0.01,
      order_price
    );

    if (!order) throw new Error("Failed to create order");

    // check if order is created successfully and if order is created successfully then cancel that order after 10 sec
    setTimeout(async () => {
      try {
        const cancelOrder = await Bybit.cancelOrder(order.id, "ETH/USDT");
        console.log("Order cancelled successfully:", cancelOrder);
      } catch (error: any) {
        console.error("Failed to cancel order:", error.message);
      }
    }, 10000);
    return order;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const main = async () => {
  const balance = await getBalance();
  console.log("Balance:", balance);
  const tickerInfo = await getTickerInfo("ETH/USDT");
  console.log("ETH/USDT Ticker Info:", tickerInfo);
  const order = await createCustomEthOrder();
  console.log("Order:", order);
};
main();
