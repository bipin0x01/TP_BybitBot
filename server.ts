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
const createRandomOrder = async (basePrice: number) => {
  // Generate a random order side: buy or sell
  const randomOrderSide = Math.random() > 0.5 ? "buy" : "sell";

  // Calculate a random spread between -0.05 (-5%) and 0.05 (5%) of the LTP
  const spread = Math.random() * 0.1 - 0.05; // Spread from -5% to +5%

  // Adjust the price by the spread
  const price = basePrice * (1 + spread);

  // Place the order with a fixed amount for simplicity, could also be randomized
  await Bybit.createOrder("DOT/USDT", "limit", randomOrderSide, 0.001, price);

  console.log(`Created ${randomOrderSide} order at price: ${price}`);
};

const main = async () => {
  console.log(await getBalance());
  const tickerInfo = await getTickerInfo("DOT/USDT");

  // Assuming getTickerInfo returns an object with a 'last' property for the last price
  let lastPrice = tickerInfo?.last;

  // Create a random order based on the last traded price
  await createRandomOrder(lastPrice);

  // Wait for 20 seconds before placing another order
  await new Promise((resolve) => setTimeout(resolve, 20000));

  // Get updated ticker info in case the price has changed
  const updatedTickerInfo = await getTickerInfo("DOT/USDT");
  lastPrice = updatedTickerInfo?.last;

  // Create another random order based on the updated last traded price
  await createRandomOrder(lastPrice);
};

// Run the main function in a loop with a 6-second interval
setInterval(() => {
  main().catch(console.error); // Catch and log any errors
}, 60000); // Adjusted to 60 seconds for practicality
