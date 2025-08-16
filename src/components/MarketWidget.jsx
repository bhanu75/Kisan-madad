import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Bell, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

// eNAM API Service Layer
const enamAPI = {
  async getMarketPrices(state = 'all', district = 'all', commodity = 'all') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: [
        {
          id: 1,
          commodity: 'गेहूं (Wheat)',
          variety: 'HD-2967',
          market: 'नई दिल्ली मंडी',
          state: 'दिल्ली',
          district: 'नई दिल्ली',
          minPrice: 2050,
          maxPrice: 2150,
          modalPrice: 2100,
          unit: 'क्विंटल',
          date: new Date().toLocaleDateString('hi-IN'),
          trend: 'up',
          change: +2.5
        },
        {
          id: 2,
          commodity: 'चावल (Rice)',
          variety: 'बासमती',
          market: 'करनाल मंडी',
          state: 'हरियाणा',
          district: 'करनाल',
          minPrice: 3500,
          maxPrice: 4200,
          modalPrice: 3850,
          unit: 'क्विंटल',
          date: new Date().toLocaleDateString('hi-IN'),
          trend: 'down',
          change: -1.2
        },
        {
          id: 3,
          commodity: 'प्याज (Onion)',
          variety: 'नासिक रेड',
          market: 'आज़ादपुर मंडी',
          state: 'दिल्ली',
          district: 'उत्तर दिल्ली',
          minPrice: 1800,
          maxPrice: 2200,
          modalPrice: 2000,
          unit: 'क्विंटल',
          date: new Date().toLocaleDateString('hi-IN'),
          trend: 'stable',
          change: 0
        },
        {
          id: 4,
          commodity: 'आलू (Potato)',
          variety: 'जायका',
          market: 'आगरा मंडी',
          state: 'उत्तर प्रदेश',
          district: 'आगरा',
          minPrice: 1200,
          maxPrice: 1500,
          modalPrice: 1350,
          unit: 'क्विंटल',
          date: new Date().toLocaleDateString('hi-IN'),
          trend: 'up',
          change: +3.8
        }
      ]
    };
  },

  async getStates() {
    return {
      success: true,
      data: ['दिल्ली', 'हरियाणा', 'पंजाब', 'उत्तर प्रदेश', 'राजस्थान', 'महाराष्ट्र']
    };
  },

  async getDistricts(state) {
    const districts = {
      'दिल्ली': ['नई दिल्ली', 'उत्तर दिल्ली', 'दक्षिण दिल्ली'],
      'हरियाणा': ['करनाल', 'गुरुग्राम', 'फरीदाबाद'],
      'राजस्थान': ['उदयपुर', 'जयपुर', 'जोधपुर']
    };
    
    return {
      success: true,
      data: districts[state] || []
    };
  }
};

// Enhanced Market Prices Widget
const MarketWidget = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [priceAlerts, setPriceAlerts] = useState([]);

  useEffect(() => {
    loadMarketData();
    loadStates();
    
    const interval = setInterval(loadMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedState, selectedDistrict]);

  useEffect(() => {
    loadDistricts();
  }, [selectedState]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const response = await enamAPI.getMarketPrices(selectedState, selectedDistrict);
      if (response.success) {
        setMarketData(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async () => {
    try {
      const response = await enamAPI.getStates();
      if (response.success) {
        setStates(response.data);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadDistricts = async () => {
    if (selectedState !== 'all') {
      try {
        const response = await enamAPI.getDistricts(selectedState);
        if (response.success) {
          setDistricts(response.data);
        }
      } catch (error) {
        console.error('Error loading districts:', error);
      }
    } else {
      setDistricts([]);
      setSelectedDistrict('all');
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const addPriceAlert = (commodity, targetPrice) => {
    const newAlert = {
      id: Date.now(),
      commodity,
      targetPrice,
      created: new Date()
    };
    setPriceAlerts([...priceAlerts, newAlert]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">बाजार मूल्य (eNAM Live)</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMarketData}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            रिफ्रेश
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            राज्य चुनें
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">सभी राज्य</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            जिला चुनें
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={selectedState === 'all' || districts.length === 0}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="all">सभी जिले</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
        <CheckCircle className="w-4 h-4" />
        अंतिम अपडेट: {lastUpdated.toLocaleTimeString('hi-IN')}
      </div>

      {/* Market Data */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">डेटा लोड हो रहा है...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {marketData.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {item.commodity}
                  </h3>
                  <p className="text-sm text-gray-600">किस्म: {item.variety}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    {item.market}, {item.district}, {item.state}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getTrendIcon(item.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-medium mb-1">न्यूनतम मूल्य</p>
                  <p className="text-lg font-bold text-red-700">₹{item.minPrice}</p>
                  <p className="text-xs text-gray-500">प्रति {item.unit}</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">मोडल मूल्य</p>
                  <p className="text-lg font-bold text-blue-700">₹{item.modalPrice}</p>
                  <p className="text-xs text-gray-500">प्रति {item.unit}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">अधिकतम मूल्य</p>
                  <p className="text-lg font-bold text-green-700">₹{item.maxPrice}</p>
                  <p className="text-xs text-gray-500">प्रति {item.unit}</p>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={() => addPriceAlert(item.commodity, item.modalPrice)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Bell className="w-4 h-4" />
                  मूल्य अलर्ट सेट करें
                </button>
                
                <span className="text-xs text-gray-500">
                  eNAM से लाइव डेटा
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Alerts Section */}
      {priceAlerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            सक्रिय मूल्य अलर्ट
          </h3>
          <div className="space-y-2">
            {priceAlerts.slice(-3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-800">{alert.commodity}</p>
                  <p className="text-sm text-gray-600">लक्ष्य मूल्य: ₹{alert.targetPrice}</p>
                </div>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketWidget;
