import React, { useState, useEffect } from 'react';
import { Users, Home, TrendingUp, Bell, User, Upload, Camera, Eye, Droplets, Bug, Leaf, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

// Import new components
import MarketWidget from './components/MarketWidget.jsx';
import LandownerWidget from './components/LandownerWidget.jsx';

// ========================
// UTILITY COMPONENTS
// ========================

const CardComponent = ({ children, className = "", title, statusColor = "border-gray-200" }) => (
  <div className={`bg-white rounded-lg border-2 ${statusColor} shadow-sm p-4 ${className}`}>
    {title && <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>}
    {children}
  </div>
);

const Loader = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeClasses[size]} border-2 border-green-500 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

const Toast = ({ message, type = "info", isVisible, onClose }) => {
  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500", 
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 ${bgColors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`}>
      {message}
    </div>
  );
};

// ========================
// AUTH COMPONENTS
// ========================

const LoginForm = ({ onSubmit, loading = false, error = "" }) => {
  const [formData, setFormData] = useState({ phone: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <CardComponent className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">किसान मदद</h1>
          <p className="text-gray-600 mt-2">अपना खाता में लॉगिन करें</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">मोबाइल नंबर</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10-अंकों का मोबाइल नंबर"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">पासवर्ड</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="पासवर्ड डालें"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader size="sm" /> : "लॉगिन करें"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            नया खाता बनाएं?{" "}
            <button className="text-green-500 font-semibold hover:underline">
              साइन अप करें
            </button>
          </p>
        </div>
      </CardComponent>
    </div>
  );
};

const SignupForm = ({ onSubmit, loading = false, error = "" }) => {
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    password: "", 
    confirmPassword: "",
    location: ""
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <CardComponent className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">नया खाता बनाएं</h1>
          <p className="text-gray-600 mt-2">किसान मदद में शामिल हों</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">पूरा नाम</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="अपना नाम डालें"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">स्थान</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="गांव/शहर का नाम"
            />
          </div>

          <button
            onClick={() => onSubmit(formData)}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader size="sm" /> : "खाता बनाएं"}
          </button>
        </div>
      </CardComponent>
    </div>
  );
};

// ========================
// DASHBOARD WIDGETS
// ========================

const FarmOverviewCard = ({ farmData }) => (
  <CardComponent title="फार्म विवरण" statusColor="border-green-200">
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{farmData?.totalArea || "5.2"}</div>
        <div className="text-sm text-gray-600">एकड़</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{farmData?.crops || "3"}</div>
        <div className="text-sm text-gray-600">फसलें</div>
      </div>
    </div>
    <div className="mt-4 bg-green-50 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-800">मुख्य फसल: {farmData?.mainCrop || "गेहूं"}</span>
      </div>
    </div>
  </CardComponent>
);

const CropHealthWidget = ({ healthData }) => (
  <CardComponent title="फसल स्वास्थ्य" statusColor="border-green-200">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-lg font-semibold text-green-600">
          {healthData?.status || "अच्छी"}
        </div>
        <div className="text-sm text-gray-600">
          अंतिम जांच: {healthData?.lastCheck || "2 दिन पहले"}
        </div>
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Leaf className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </CardComponent>
);

const SoilHealthWidget = ({ soilData }) => (
  <CardComponent title="मिट्टी की सेहत" statusColor="border-yellow-200">
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">pH स्तर</span>
        <span className="text-sm font-semibold">{soilData?.ph || "6.8"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">नमी</span>
        <span className="text-sm font-semibold">{soilData?.moisture || "65%"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">पोषक तत्व</span>
        <span className="text-sm font-semibold text-yellow-600">मध्यम</span>
      </div>
    </div>
  </CardComponent>
);

const PestAlertWidget = ({ alertData }) => (
  <CardComponent title="कीट चेतावनी" statusColor="border-red-200">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <Bug className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <div className="font-semibold text-red-600">
          {alertData?.level || "मध्यम जोखिम"}
        </div>
        <div className="text-sm text-gray-600">
          {alertData?.pest || "एफिड्स"} का खतरा
        </div>
      </div>
    </div>
  </CardComponent>
);

const IrrigationScheduleWidget = ({ scheduleData }) => (
  <CardComponent title="सिंचाई कार्यक्रम" statusColor="border-blue-200">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Droplets className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div className="font-semibold text-blue-600">
          अगली सिंचाई
        </div>
        <div className="text-sm text-gray-600">
          {scheduleData?.nextWatering || "कल सुबह 6:00 बजे"}
        </div>
      </div>
    </div>
  </CardComponent>
);

const MarketPricesWidget = ({ priceData }) => (
  <CardComponent title="बाजार भाव" statusColor="border-green-200">
    <div className="space-y-2">
      {(priceData?.crops || [
        { name: "गेहूं", price: "₹2,150", change: "+₹50" },
        { name: "चना", price: "₹5,200", change: "-₹100" }
      ]).map((crop, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <span className="text-sm font-medium">{crop.name}</span>
          <div className="text-right">
            <div className="text-sm font-semibold">{crop.price}</div>
            <div className={`text-xs ${crop.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
              {crop.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  </CardComponent>
);

// ========================
// COMPONENT REGISTRY
// ========================

// Central registry for all dashboard widgets
const WIDGET_REGISTRY = {
  farmOverview: FarmOverviewCard,
  cropHealth: CropHealthWidget,
  soilHealth: SoilHealthWidget,
  pestAlert: PestAlertWidget,
  irrigationSchedule: IrrigationScheduleWidget,
  marketPrices: MarketPricesWidget,
  marketWidget: MarketWidget,
  landownerWidget: LandownerWidget,
};

// Widget configuration for different layouts
const WIDGET_LAYOUTS = {
  dashboard: [
    'farmOverview',
    'cropHealth', 
    'soilHealth',
    'pestAlert',
    'irrigationSchedule',
    'marketPrices'
    'landownerWidget'
  ],
  market: [
    'marketPrices',
    'marketWidget'
  ],
  landowner: [
    'farmOverview',
    'landownerWidget',
    'soilHealth'
  ]
};

// ========================
// WIDGET RENDERER
// ========================

const WidgetRenderer = ({ widgetId, data, ...props }) => {
  const WidgetComponent = WIDGET_REGISTRY[widgetId];
  
  if (!WidgetComponent) {
    console.warn(`Widget "${widgetId}" not found in registry`);
    return null;
  }
  
  return <WidgetComponent {...data} {...props} />;
};

const DynamicWidgetGrid = ({ layout = 'dashboard', data = {}, className = "" }) => {
  const widgets = WIDGET_LAYOUTS[layout] || WIDGET_LAYOUTS.dashboard;
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {widgets.map((widgetId) => (
        <WidgetRenderer
          key={widgetId}
          widgetId={widgetId}
          data={data[widgetId] || data}
        />
      ))}
    </div>
  );
};

// ========================
// INTERACTION COMPONENTS
// ========================

const ImageUploadComponent = ({ onImageUpload, loading = false }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <CardComponent title="फोटो अपलोड करें">
      <div className="space-y-4">
        {preview && (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            <button 
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <label className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-center cursor-pointer hover:bg-blue-600 transition-colors">
            <Camera className="w-4 h-4 inline mr-2" />
            कैमरा
            <input
              type="file"
              accept="image/*"
              capture="camera"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>
          
          <label className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-center cursor-pointer hover:bg-green-600 transition-colors">
            <Upload className="w-4 h-4 inline mr-2" />
            गैलरी
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
        
        {loading && <Loader />}
      </div>
    </CardComponent>
  );
};

const NotificationsPanel = ({ notifications = [] }) => (
  <CardComponent title="सूचनाएं">
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">कोई नई सूचना नहीं</p>
      ) : (
        notifications.map((notif, idx) => (
          <div key={idx} className={`p-3 rounded-lg border-l-4 ${
            notif.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
            notif.type === 'danger' ? 'bg-red-50 border-red-400' :
            'bg-blue-50 border-blue-400'
          }`}>
            <div className="font-medium text-sm">{notif.title}</div>
            <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
            <div className="text-xs text-gray-500 mt-2">{notif.timestamp}</div>
          </div>
        ))
      )}
    </div>
  </CardComponent>
);

// ========================
// NAVIGATION COMPONENTS
// ========================

const BottomTabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'डैशबोर्ड', icon: Home },
    { id: 'farm', label: 'फार्म', icon: Leaf },
    { id: 'market', label: 'बाजार', icon: TrendingUp },
    { id: 'alerts', label: 'अलर्ट', icon: Bell },
    { id: 'profile', label: 'प्रोफाइल', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ========================
// SCREEN COMPONENTS
// ========================

const DashboardScreen = ({ data }) => (
  <div className="p-4 pb-20 space-y-4">
    <DynamicWidgetGrid layout="dashboard" data={data} />
  </div>
);

const FarmScreen = ({ onImageUpload }) => (
  <div className="p-4 pb-20 space-y-4">
    <ImageUploadComponent onImageUpload={onImageUpload} />
    <CardComponent title="फसल प्रबंधन">
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium hover:bg-green-200 transition-colors">
          <Leaf className="w-5 h-5 mx-auto mb-1" />
          फसल जोड़ें
        </button>
        <button className="bg-blue-100 text-blue-800 py-3 px-4 rounded-lg font-medium hover:bg-blue-200 transition-colors">
          <Calendar className="w-5 h-5 mx-auto mb-1" />
          कार्यक्रम
        </button>
      </div>
    </CardComponent>
  </div>
);

const MarketScreen = ({ data }) => (
  <div className="p-4 pb-20 space-y-4">
    <DynamicWidgetGrid layout="market" data={data} />
  </div>
);

const LandownerScreen = ({ data }) => (
  <div className="p-4 pb-20 space-y-4">
    <DynamicWidgetGrid layout="landowner" data={data} />
  </div>
);

// ========================
// MAIN APP COMPONENT
// ========================

const KisanMadadApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [notifications] = useState([
    {
      title: "सिंचाई अलर्ट",
      message: "कल सुबह 6 बजे सिंचाई का समय है",
      timestamp: "2 घंटे पहले",
      type: "info"
    },
    {
      title: "कीट चेतावनी", 
      message: "एफिड्स का खतरा बढ़ रहा है",
      timestamp: "5 घंटे पहले",
      type: "warning"
    }
  ]);

  const dashboardData = {
    farm: { totalArea: "5.2", crops: "3", mainCrop: "गेहूं" },
    cropHealth: { status: "अच्छी", lastCheck: "2 दिन पहले" },
    soil: { ph: "6.8", moisture: "65%" },
    pestAlert: { level: "मध्यम जोखिम", pest: "एफिड्स" },
    irrigation: { nextWatering: "कल सुबह 6:00 बजे" },
    market: {
      crops: [
        { name: "गेहूं", price: "₹2,150", change: "+₹50" },
        { name: "चना", price: "₹5,200", change: "-₹100" }
      ]
    },
    // Data for new widgets
    marketWidget: {
      // Add specific data for MarketWidget
      trends: [],
      analysis: {},
    },
    landownerWidget: {
      // Add specific data for LandownerWidget
      properties: [],
      contracts: [],
    }
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentScreen('main');
      setLoading(false);
      showToast('सफलतापूर्वक लॉगिन हो गए', 'success');
    }, 1500);
  };

  const handleImageUpload = (file) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('फोटो अपलोड हो गई', 'success');
    }, 2000);
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  if (currentScreen === 'login') {
    return (
      <>
        <LoginForm onSubmit={handleLogin} loading={loading} />
        <Toast {...toast} onClose={hideToast} />
      </>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">किसान मदद</h1>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-600 hover:text-gray-800">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        {activeTab === 'dashboard' && <DashboardScreen data={dashboardData} />}
        {activeTab === 'farm' && <FarmScreen onImageUpload={handleImageUpload} />}
        {activeTab === 'market' && <MarketScreen data={dashboardData} />}
        {activeTab === 'alerts' && (
          <div className="p-4 pb-20">
            <NotificationsPanel notifications={notifications} />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="p-4 pb-20">
            <CardComponent title="प्रोफाइल">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">राम कुमार</h3>
                  <p className="text-sm text-gray-600">9876543210</p>
                </div>
              </div>
            </CardComponent>
          </div>
        )}
      </main>

      <BottomTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Toast {...toast} onClose={hideToast} />
    </div>
  );
};

export default KisanMadadApp;
