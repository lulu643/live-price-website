// chart.js
var durationSeconds = 2 * 60; // 2 minutes: remember to change this part when every function is tested

window.onload = function() {
    var binanceSocket = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@kline_1s');

    var chart = LightweightCharts.createChart(document.getElementById('chart'), {
        width: 800,
        height: 600,
        layout: {
            backgroundColor: '#000000',
            textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
            vertLines: {
                color: 'rgba(197, 203, 206, 0.5)',
            },
            horzLines: {
                color: 'rgba(197, 203, 206, 0.5)',
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
        },
    });

    var lineSeries = chart.addLineSeries({
        color: 'rgba(4, 111, 232, 1)',
        lineWidth: 2,
    });

    var volumeDiv = document.getElementById('volume');
    var volumeSum = 0;

    var priceChangeDiv = document.getElementById('priceChange');
    var initialPrice = null;

    var volCalc = new SDCalculator();

    var data = [];

    binanceSocket.onmessage = function(event) {
        console.log(event.data);
        
        var messageObject = JSON.parse(event.data);

        var time = messageObject.k.t / 1000;
        var close = parseFloat(messageObject.k.c);

        data.push({ time: time, value: close });

        var oneDayAgo = Date.now() / 1000 - durationSeconds;
        while (data[0] && data[0].time < oneDayAgo) {
            data.shift();
        }

        lineSeries.setData(data.map(function(item) {
            return { time: item.time, value: item.value };
        }));

        // Extract the volume from the event
        var volume = parseFloat(messageObject.k.v);

        // Add the volume to our sum
        volumeSum += volume;

        // If we have more than 24 hours of data, subtract the volume of the oldest point
        while (data[0] && data[0].time < oneDayAgo) {
            volumeSum -= data[0].volume;
            data.shift();
        }

        // Update the div with the new volume sum
        volumeDiv.innerText = '24hr Volume: ' + volumeSum.toFixed(2);

        // Get the closing price
        var close = parseFloat(messageObject.k.c);

        // If this is the first data point, save the closing price
        if (initialPrice === null) {
            initialPrice = close;
        }

        // Calculate the percentage change from the initial price
        var priceChange = ((close - initialPrice) / initialPrice) * 100;

        // Update the div with the price change
        priceChangeDiv.innerText = '24hr Price Change: ' + priceChange.toFixed(2) + '%';

        // Add the closing price to the calculator
        volCalc.add(close);

        // If we have more than 24 hours of data, remove the oldest price from the calculator
        while (data[0] && data[0].time < oneDayAgo) {
            volCalc.remove(data[0].close);
            data.shift();
        }

        // Get the standard deviation (volatility) and display it if possible
        var volatilityDiv = document.getElementById('volatility');
        if (volCalc.getCount() >= 2) { // Check if there are at least 2 data points
            volatilityDiv.innerText = '24hr Volatility: ' + volCalc.getSampleSD().toFixed(2);
        } else {
            volatilityDiv.innerText = 'Waiting for more data...';
        }

        // Calculate pseudo "Market Cap"
        var marketCap = volume * close;
        var marketCapDiv = document.getElementById('marketCap');
        marketCapDiv.innerText = '24hr Pseudo Market Cap: ' + marketCap.toFixed(2);
    };
};
