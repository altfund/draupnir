// Handle routes
const express = require('express');
const router = express.Router();
// Handle API requests
const fetch = require('node-fetch');
// Adds functions for working with arrays etc.
const _ = require('lodash');

// Route for generating orders
// Example API call:
// http://localhost:8000/api/order?buying=btc&tally=usd&amount=20000&btceLimit=5000&bitstampLimit=5000&bitfinexLimit=5000
router.get('/order', function(req, res, next) {
  // Grab everything in the query string
  qs = req.query;

  // Set the coin rounding precision. 8 for BTC, 18 for ETH.
  const PRECIS = qs.buying === 'btc' ? 8 : 18;

  // Set the window we want to land in around the asked amount. O.1% for BTC,
  // 1% for ETH
  const WINDOW = qs.tally === 'usd' ? 0.01 : 0.001;

  // Create a fetch promise for each API call. These will all be called by a
  // Promise.all later
  const fetchBitfinex = fetch(`https://api.bitfinex.com/v1/book/${qs.buying}usd/?limit_bids=0`)
    .catch((err) => {
      console.log('Fetching from Bitfinex failed with: ' + err);
    })
    // The APIs return JSON, so we parse it into a JavaScript object
    .then((res) => res.json())
    // When the parsed JSON is ready we can muck around with it
    .then((json) => {
      console.log('Bitfinex order book fetched...');
      // Just take the part of the returned order book that we want
      orderBook = json.asks;
      // Setup an array to store the orders from the exchange
      massagedOrderBook = [];
      // Massage each order returned by the exchange into a standard format
      orderBook.forEach((order) => {
        massagedOrder = {};
        massagedOrder.exchange = 'bitfinex';
        massagedOrder.price = parseFloat(order.price);
        massagedOrder.amount = parseFloat(order.amount);
        rawTotal = massagedOrder.price * massagedOrder.amount;
        // Round fiat to two decimals
        massagedOrder.orderTotal = parseFloat(rawTotal.toFixed(2));

        massagedOrderBook.push(massagedOrder);
      });
      return massagedOrderBook;
    });

  const fetchBitstamp = fetch('https://www.bitstamp.net/api/order_book/')
    .catch((err) => {
      console.log('Fetching from Bitstamp failed with: ' + err);
    })
    .then((res) => res.json())
    .then((json) => {
      console.log('Bitstamp order book fetched...');
      orderBook = json.asks;
      massagedOrderBook = [];

      orderBook.forEach((order) => {
        massagedOrder = {};
        massagedOrder.exchange = 'bitstamp';
        massagedOrder.price = parseFloat(order[0]);
        massagedOrder.amount = parseFloat(order[1]);
        rawTotal = massagedOrder.price * massagedOrder.amount;
        // Round fiat to two decimals
        massagedOrder.orderTotal = parseFloat(rawTotal.toFixed(2));

        massagedOrderBook.push(massagedOrder);
      });
      // Bitstamp, in their infinite wisdom, don't sell ETH, so we don't return
      // anything unless it is a BTC trade
      if (qs.buying != 'btc') {
        return;
      };
      return massagedOrderBook;
    });

  const fetchBTCe = fetch(`https://btc-e.com/api/3/depth/${qs.buying}_usd/\
                           ?limit=5000`, {method: 'GET', timeout: 5000})
    .then((res) => res.json())
    .then((json) => {
      console.log('BTC-e order book fetched...');
      orderBook = json[`${qs.buying}_usd`].asks;
      massagedOrderBook = [];

      orderBook.forEach((order) => {
        massagedOrder = {};
        massagedOrder.exchange = 'btce';
        massagedOrder.price = order[0];
        massagedOrder.amount = order[1];
        rawTotal = massagedOrder.price * massagedOrder.amount;
        // Round fiat to two decimals
        massagedOrder.orderTotal = parseFloat(rawTotal.toFixed(2));

        massagedOrderBook.push(massagedOrder);
      });
      return massagedOrderBook;
    })
    .catch((err) => {
      console.log('Fetching from BTC-e failed with: ' + err);
      console.error(err);
      return;
    });

  // Wait for all the API calls to return before we play with the data
  // Promise.all([fetchBTCe, fetchBitfinex, fetchBitstamp])
  Promise.all([fetchBitfinex, fetchBitstamp])
    .catch((err) => {
      console.log('Promise.all failed with: ' + err);
      console.error(err);
    })
    .then((orderBooks) => {
      // Promise.all gives us an array of the returned values, so we flatten
      // them into a single array
      fullOrderBook = _.flattenDeep(orderBooks);
      // We now have a single array of objects, so we sort them by their price
      // property
      fullOrderBook = _.sortBy(fullOrderBook, ['price']);

      // Pull the individual exchange limits out of the query string so that its
      // easier to check them below.
      const limits = {
        btce: qs.btceLimit,
        bitstamp: qs.bitstampLimit,
        bitfinex: qs.bitfinexLimit,
      };

      // This is where will will put all the orders we want to buy, up to the
      // amount requested
      let orderData = {
        totalUsdSpent: 0,
        totalAudSpent: 0,
        totalCoinBought: 0,
        exchanges: {
          bitfinex: {
            usdSpent: 0,
            audSpent: 0,
            coinBought: 0,
          },
          bitstamp: {
            usdSpent: 0,
            audSpent: 0,
            coinBought: 0,
          },
          btce: {
            usdSpent: 0,
            audSpent: 0,
            coinBought: 0,
          },
        },
        orders: [],
      };

      // This is where we will keep a tally of all the money spent over
      // each exchange, so we can check limits.
      let tally = 0;

      // Iterate through the complete order book. 'for...of' lets us 'break' out
      // of the loop, 'forEach' wouldn't
      for (let order of fullOrderBook) {
        // Check if we are with 0.1% of the asked amount. If we are, we can stop
        // looking
        // if (tally >= (qs.amount - (qs.amount * WINDOW)) && tally <= (qs.amount + (qs.amount * WINDOW))) {
        if (tally >= qs.amount) {
          break;
        }

        let thisExchange = orderData.exchanges[order.exchange];

        // Work out how much is left to order in total and also from this
        // particular exchange
        let totalRemaining = qs.amount - tally;
        let exchangeRemaining = limits[order.exchange] - thisExchange.usdSpent;

        // Check if the exchange this order is from is over its limit and jump
        // to the next order if it is.
        if (exchangeRemaining <= 0) {
          continue;
        }

        // Tallying by USD, not coins
        if (qs.tally == 'usd') {
          // Check if the limit remaining on the exchange is equal or larger 
          // than the total order amount remaining. Otherwise, the maximum we 
          // can take from this order will be the exchange limit amount 
          // remaining.
          if (exchangeRemaining < totalRemaining) {
            totalRemaining = exchangeRemaining;
          }
          // Order is more than what we need to fulfil requested amount, we only
          // need part of it
          if (order.orderTotal > totalRemaining) {
            let partialOrder = order;
            partialOrder.amount = totalRemaining / partialOrder.price;
            partialOrder.amount = parseFloat(partialOrder.amount.toFixed(PRECIS));
            // Set the total price of the order based on adjusted amount
            partialOrder.orderTotal = partialOrder.price * partialOrder.amount;
            partialOrder.orderTotal = parseFloat(partialOrder.orderTotal.toFixed(2));
            tally += partialOrder.orderTotal;

            // Update exchange limit remaining. This is always tallied in usd.
            thisExchange.usdSpent += partialOrder.orderTotal;
            thisExchange.usdSpent = parseFloat(thisExchange.usdSpent.toFixed(2));
            thisExchange.coinBought += partialOrder.amount;
            thisExchange.coinBought = parseFloat(thisExchange.coinBought.toFixed(PRECIS));
            orderData.totalUsdSpent += partialOrder.orderTotal;
            let roundedAmount = parseFloat(partialOrder.amount.toFixed(PRECIS));
            orderData.totalCoinBought += roundedAmount;

            orderData.orders.push(partialOrder);

          // If the order in the book is less than the requested amount, grab
          // the whole order and move onto the next one
          } else {
            // Check if the order amount is measured in fiat or crypto and tally
            // accordingly
            tally += order.orderTotal;

            // Update exchange limit remaining. This is always tallied in usd.
            thisExchange.usdSpent += order.orderTotal;
            thisExchange.usdSpent = parseFloat(thisExchange.usdSpent.toFixed(2));
            thisExchange.coinBought += order.amount;
            thisExchange.coinBought = parseFloat(thisExchange.coinBought.toFixed(PRECIS));
            orderData.totalUsdSpent += order.orderTotal;
            orderData.totalCoinBought += order.amount;

            orderData.orders.push(order);
          }

        // Not tallying by USD, so must be tallying by coins
        } else {
          // The amount we can buy from this order is potentially limited by the
          // float remaining on the exchange. Using Math.min() we can find the
          // smallest number out of this order's total value and the exchange's
          // remaining float
          // We have a certain amount of coins we are looking for. We need to
          // know how much that would cost if we bought them all from this
          // order. This will let us work out if we can afford to buy them from
          // this order on this exchange.
          let remainingValue = totalRemaining * order.price;
          let maxAvailiable = Math.min(exchangeRemaining, order.orderTotal, remainingValue);

          if (maxAvailiable < order.orderTotal) {
            // Take partial amount
            let partialOrder = order;
            partialOrder.amount = maxAvailiable / partialOrder.price;
            partialOrder.amount = parseFloat(partialOrder.amount.toFixed(PRECIS));
            partialOrder.orderTotal = partialOrder.price * partialOrder.amount;
            partialOrder.orderTotal = parseFloat(partialOrder.orderTotal.toFixed(2));
            tally += partialOrder.amount;

            thisExchange.usdSpent += partialOrder.orderTotal;
            thisExchange.usdSpent = parseFloat(thisExchange.usdSpent.toFixed(2));
            thisExchange.coinBought += partialOrder.amount;
            thisExchange.coinBought = parseFloat(thisExchange.coinBought.toFixed(PRECIS));
            orderData.totalUsdSpent += partialOrder.orderTotal;
            orderData.totalCoinBought += partialOrder.amount;

            orderData.orders.push(partialOrder);
          } else {
            // take whole maxAvailiable from this oder
            tally += order.amount;

            thisExchange.usdSpent += order.orderTotal;
            thisExchange.usdSpent = parseFloat(thisExchange.usdSpent.toFixed(2));
            thisExchange.coinBought += order.amount;
            thisExchange.coinBought = parseFloat(thisExchange.coinBought.toFixed(PRECIS));
            orderData.totalUsdSpent += order.orderTotal;
            orderData.totalCoinBought += order.amount;

            orderData.orders.push(order);
          }
        }
      }
      fetch('http://localhost:8000/api/forexrates')
        .catch((err) => {
          console.log('Fetching the forex rates failed with: ' + err);
        })
        .then((res) => res.json())
        .then((rates) => {
          orderData.totalUsdSpent = parseFloat(orderData.totalUsdSpent.toFixed(2));
          let totalConversion = orderData.totalUsdSpent * rates.usdToAud;
          orderData.totalAudSpent = parseFloat(totalConversion.toFixed(2));
          orderData.totalCoinBought = parseFloat(orderData.totalCoinBought.toFixed(PRECIS));
          Object.keys(orderData.exchanges).forEach((exchange) => {
            thisExchange = orderData.exchanges[exchange];
            let conversion = thisExchange.usdSpent * rates.usdToAud;
            thisExchange.audSpent = parseFloat(conversion.toFixed(2));
          });
          res.send(orderData);
        });
    });
});
module.exports = router;
