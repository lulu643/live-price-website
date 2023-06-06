// sd_calculator.js
function SDCalculator() {
    var _count = 0;
    var _sumX = 0;
    var _sumXX = 0;

    this.add = function(value) {
        _sumX += value;
        _sumXX += value * value;
        _count++;
    };

    this.remove = function(value) {
        _sumX -= value;
        _sumXX -= value * value;
        _count--;
    };

    this.getCount = function() {
        return _count;
    };

    this.getSum = function() {
        if (_count < 1)
            throw new Error("Can't compute a sum with an empty data set");
        return _sumX;
    };

    this.getMean = function() {
        return this.getSum() / this.getCount();
    };

    this.getSampleSD = function() {
        if (_count < 2)
            throw new Error("Can't compute sample standard deviation with fewer than 2 data points");
        return Math.sqrt((_sumXX / _count) - Math.pow(_sumX / _count, 2)) * Math.sqrt(_count / (_count - 1));
    };
}
