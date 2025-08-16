import React, { useState, useRef } from 'react';
import { User, MapPin, Upload, FileText, Droplets, Sprout, AlertCircle, CheckCircle, Camera, Map } from 'lucide-react';

// Utility Components (consistent with existing app)
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

const ValidationMessage = ({ message, type = "error" }) => {
  const colors = {
    error: "text-red-600 bg-red-50 border-red-200",
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200"
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${colors[type]}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

// Main Landowner Registration Component
const LandownerRegistrationModule = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    // Owner Information
    ownerName: '',
    contactNumber: '',
    alternateContact: '',
    email: '',
    
    // Land Details
    surveyNumber: '',
    totalArea: '',
    cultivableArea: '',
    soilType: '',
    irrigationType: '',
    waterAvailability: '',
    currentCrop: '',
    leaseType: '',
    
    // Location
    district: '',
    tehsil: '',
    village: '',
    pincode: '',
    coordinates: { lat: null, lng: null },
    
    // Documents
    documents: {
      patta: null,
      extract7_12: null,
      saleDeed: null,
      other: null
    },
    
    // Terms
    rentAmount: '',
    profitSharePercentage: '',
    leaseDuration: '',
    additionalTerms: ''
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isEligible, setIsEligible] = useState(null);
  const [documentPreviews, setDocumentPreviews] = useState({});
  const fileInputRefs = useRef({});

  // Validation Rules
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.ownerName.trim()) newErrors.ownerName = 'मालिक का नाम आवश्यक है';
      if (!formData.contactNumber || !/^[6-9]\d{9}$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'वैध मोबाइल नंबर दर्ज करें (10 अंक)';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'वैध ईमेल पता दर्ज करें';
      }
    }

    if (step === 2) {
      if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'सर्वे नंबर आवश्यक है';
      if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'कुल क्षेत्रफल आवश्यक है';
      if (!formData.cultivableArea || formData.cultivableArea <= 0) newErrors.cultivableArea = 'कृषि योग्य क्षेत्रफल आवश्यक है';
      if (parseFloat(formData.cultivableArea) > parseFloat(formData.totalArea)) {
        newErrors.cultivableArea = 'कृषि योग्य क्षेत्रफल कुल क्षेत्रफल से अधिक नहीं हो सकता';
      }
      if (!formData.soilType) newErrors.soilType = 'मिट्टी का प्रकार चुनें';
      if (!formData.irrigationType) newErrors.irrigationType = 'सिंचाई का प्रकार चुनें';
      if (!formData.waterAvailability) newErrors.waterAvailability = 'पानी की उपलब्धता चुनें';
    }

    if (step === 3) {
      if (!formData.district.trim()) newErrors.district = 'जिला आवश्यक है';
      if (!formData.village.trim()) newErrors.village = 'गांव आवश्यक है';
      if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'वैध पिन कोड दर्ज करें (6 अंक)';
      }
    }

    if (step === 4) {
      if (!formData.leaseType) newErrors.leaseType = 'लीज का प्रकार चुनें';
      if (formData.leaseType === 'rent' && (!formData.rentAmount || formData.rentAmount <= 0)) {
        newErrors.rentAmount = 'किराया राशि आवश्यक है';
      }
      if (formData.leaseType === 'profit-share' && (!formData.profitSharePercentage || formData.profitSharePercentage <= 0 || formData.profitSharePercentage > 100)) {
        newErrors.profitSharePercentage = 'वैध लाभ हिस्सेदारी प्रतिशत दर्ज करें (1-100)';
      }
      if (!formData.leaseDuration) newErrors.leaseDuration = 'लीज की अवधि चुनें';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Eligibility Check
  const checkEligibility = () => {
    const eligibleSoilTypes = ['काली मिट्टी', 'लाल मिट्टी', 'दोमट मिट्टी', 'जलोढ़ मिट्टी'];
    const eligibleIrrigation = ['नहर', 'कुआं', 'बोरवेल', 'तालाब/झील'];
    const goodWaterAvailability = ['प्रचुर', 'पर्याप्त'];

    const isSoilEligible = eligibleSoilTypes.includes(formData.soilType);
    const isIrrigationEligible = eligibleIrrigation.includes(formData.irrigationType);
    const isWaterEligible = goodWaterAvailability.includes(formData.waterAvailability);
    const isAreaEligible = parseFloat(formData.cultivableArea) >= 0.5; // Minimum 0.5 acres

    const eligible = isSoilEligible && isIrrigationEligible && isWaterEligible && isAreaEligible;
    setIsEligible(eligible);
    return eligible;
  };

  // File Upload Handler
  const handleFileUpload = (documentType, file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'केवल JPG, PNG या PDF फाइल अपलोड करें'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'फाइल का साइज 5MB से कम होना चाहिए'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreviews(prev => ({
            ...prev,
            [documentType]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }

      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[documentType];
        return newErrors;
      });
    }
  };

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        checkEligibility();
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateStep(4) && isEligible) {
      onSubmit(formData);
    }
  };

  // Step 1: Owner Information
  const renderOwnerInfo = () => (
    <CardComponent title="मालिक की जानकारी" statusColor="border-green-200">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            मालिक का पूरा नाम *
          </label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => updateFormData('ownerName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="पूरा नाम दर्ज करें"
          />
          {errors.ownerName && <ValidationMessage message={errors.ownerName} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              मुख्य मोबाइल नंबर *
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => updateFormData('contactNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1-100% के बीच"
            />
            {errors.profitSharePercentage && <ValidationMessage message={errors.profitSharePercentage} />}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            लीज की अवधि *
          </label>
          <select
            value={formData.leaseDuration}
            onChange={(e) => updateFormData('leaseDuration', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">अवधि चुनें</option>
            <option value="1">1 वर्ष</option>
            <option value="2">2 वर्ष</option>
            <option value="3">3 वर्ष</option>
            <option value="4">4 वर्ष</option>
            <option value="5">5 वर्ष</option>
            <option value="custom">अन्य</option>
          </select>
          {errors.leaseDuration && <ValidationMessage message={errors.leaseDuration} />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            अतिरिक्त शर्तें (वैकल्पिक)
          </label>
          <textarea
            value={formData.additionalTerms}
            onChange={(e) => updateFormData('additionalTerms', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="4"
            placeholder="कोई अतिरिक्त शर्तें या नोट्स..."
          />
        </div>
      </div>
    </CardComponent>
  );

  // Eligibility Check Display
  const renderEligibilityCheck = () => {
    if (isEligible === null) return null;

    return (
      <CardComponent 
        title="पात्रता जांच परिणाम" 
        statusColor={isEligible ? "border-green-200" : "border-red-200"}
        className="mb-4"
      >
        {isEligible ? (
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">बधाई! आपकी जमीन लीज के लिए योग्य है।</div>
              <div className="text-sm text-green-600">
                आप अगले चरण में जा सकते हैं और अपनी लीज की शर्तें तय कर सकते हैं।
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">खेद है! आपकी जमीन वर्तमान में लीज के लिए योग्य नहीं है।</div>
              <div className="text-sm text-red-600 mt-2">
                <strong>आवश्यकताएं:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>उपजाऊ मिट्टी (काली, लाल, दोमट या जलोढ़)</li>
                  <li>अच्छी सिंचाई व्यवस्था (नहर, कुआं, बोरवेल या तालाब)</li>
                  <li>पर्याप्त या प्रचुर पानी की उपलब्धता</li>
                  <li>न्यूनतम 0.5 एकड़ कृषि योग्य भूमि</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardComponent>
    );
  };

  // Step Progress Indicator
  const renderProgressIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= step 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>मालिक जानकारी</span>
        <span>जमीन विवरण</span>
        <span>स्थान व दस्तावेज</span>
        <span>लीज शर्तें</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          जमीन लीज रजिस्ट्रेशन
        </h1>
        <p className="text-gray-600 text-center">
          अपनी जमीन को किराए या लाभ-हिस्सेदारी पर देने के लिए पंजीकरण करें
        </p>
      </div>

      {renderProgressIndicator()}
      
      {currentStep === 2 && renderEligibilityCheck()}

      <div className="space-y-6">
        {currentStep === 1 && renderOwnerInfo()}
        {currentStep === 2 && renderLandDetails()}
        {currentStep === 3 && renderLocationAndDocs()}
        {currentStep === 4 && renderLeaseTerms()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          पिछला
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            disabled={currentStep === 2 && isEligible === false}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            आगे
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !isEligible}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader size="sm" /> : 'सबमिट करें'}
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-1">सहायता:</div>
            <ul className="space-y-1 text-blue-700">
              <li>• सभी अनिवार्य फील्ड (*) को भरना आवश्यक है</li>
              <li>• केवल कृषि योग्य और सिंचित भूमि ही स्वीकार की जाएगी</li>
              <li>• दस्तावेज JPG, PNG या PDF फॉर्मेट में अपलोड करें (अधिकतम 5MB)</li>
              <li>• सभी जानकारी सत्यापित की जाएगी</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandownerRegistrationModule;focus:border-transparent"
              placeholder="10 अंकों का नंबर"
              maxLength="10"
            />
            {errors.contactNumber && <ValidationMessage message={errors.contactNumber} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              वैकल्पिक मोबाइल नंबर
            </label>
            <input
              type="tel"
              value={formData.alternateContact}
              onChange={(e) => updateFormData('alternateContact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="वैकल्पिक नंबर"
              maxLength="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ईमेल पता (वैकल्पिक)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="आपका ईमेल"
          />
          {errors.email && <ValidationMessage message={errors.email} />}
        </div>
      </div>
    </CardComponent>
  );

  // Step 2: Land Details
  const renderLandDetails = () => (
    <CardComponent title="जमीन का विवरण" statusColor="border-blue-200">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              सर्वे नंबर *
            </label>
            <input
              type="text"
              value={formData.surveyNumber}
              onChange={(e) => updateFormData('surveyNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="सर्वे नंबर दर्ज करें"
            />
            {errors.surveyNumber && <ValidationMessage message={errors.surveyNumber} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              कुल क्षेत्रफल (एकड़) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalArea}
              onChange={(e) => updateFormData('totalArea', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="एकड़ में"
            />
            {errors.totalArea && <ValidationMessage message={errors.totalArea} />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              कृषि योग्य क्षेत्रफल (एकड़) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cultivableArea}
              onChange={(e) => updateFormData('cultivableArea', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="कृषि योग्य क्षेत्र"
            />
            {errors.cultivableArea && <ValidationMessage message={errors.cultivableArea} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              मिट्टी का प्रकार *
            </label>
            <select
              value={formData.soilType}
              onChange={(e) => updateFormData('soilType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">मिट्टी का प्रकार चुनें</option>
              <option value="काली मिट्टी">काली मिट्टी</option>
              <option value="लाल मिट्टी">लाल मिट्टी</option>
              <option value="दोमट मिट्टी">दोमट मिट्टी</option>
              <option value="जलोढ़ मिट्टी">जलोढ़ मिट्टी</option>
              <option value="बलुई मिट्टी">बलुई मिट्टी</option>
              <option value="चिकनी मिट्टी">चिकनी मिट्टी</option>
            </select>
            {errors.soilType && <ValidationMessage message={errors.soilType} />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              सिंचाई का प्रकार *
            </label>
            <select
              value={formData.irrigationType}
              onChange={(e) => updateFormData('irrigationType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">सिंचाई का प्रकार चुनें</option>
              <option value="नहर">नहर</option>
              <option value="कुआं">कुआं</option>
              <option value="बोरवेल">बोरवेल</option>
              <option value="तालाब/झील">तालाब/झील</option>
              <option value="बारिश पर निर्भर">बारिश पर निर्भर</option>
            </select>
            {errors.irrigationType && <ValidationMessage message={errors.irrigationType} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              पानी की उपलब्धता *
            </label>
            <select
              value={formData.waterAvailability}
              onChange={(e) => updateFormData('waterAvailability', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">पानी की स्थिति चुनें</option>
              <option value="प्रचुर">प्रचुर</option>
              <option value="पर्याप्त">पर्याप्त</option>
              <option value="सीमित">सीमित</option>
              <option value="कम">कम</option>
            </select>
            {errors.waterAvailability && <ValidationMessage message={errors.waterAvailability} />}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            वर्तमान फसल (यदि कोई है)
          </label>
          <input
            type="text"
            value={formData.currentCrop}
            onChange={(e) => updateFormData('currentCrop', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="वर्तमान में उगाई जा रही फसल"
          />
        </div>
      </div>
    </CardComponent>
  );

  // Step 3: Location & Documents
  const renderLocationAndDocs = () => (
    <div className="space-y-4">
      <CardComponent title="स्थान का विवरण" statusColor="border-purple-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                जिला *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => updateFormData('district', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="जिला का नाम"
              />
              {errors.district && <ValidationMessage message={errors.district} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                तहसील
              </label>
              <input
                type="text"
                value={formData.tehsil}
                onChange={(e) => updateFormData('tehsil', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="तहसील का नाम"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                गांव/शहर *
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => updateFormData('village', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="गांव/शहर का नाम"
              />
              {errors.village && <ValidationMessage message={errors.village} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                पिन कोड *
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => updateFormData('pincode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="6 अंकों का पिन कोड"
                maxLength="6"
              />
              {errors.pincode && <ValidationMessage message={errors.pincode} />}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">जमीन की स्थिति</span>
            </div>
            <button
              type="button"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => {
                // GPS location functionality placeholder
                alert('GPS स्थिति सुविधा जल्द ही आएगी');
              }}
            >
              <Map className="w-4 h-4 inline mr-2" />
              मैप पर स्थिति चुनें
            </button>
          </div>
        </div>
      </CardComponent>

      <CardComponent title="दस्तावेज अपलोड" statusColor="border-orange-200">
        <div className="space-y-4">
          {[
            { key: 'patta', label: 'पट्टा/खसरा' },
            { key: 'extract7_12', label: '7/12 एक्सट्रैक्ट' },
            { key: 'saleDeed', label: 'सेल डीड/रजिस्ट्री' },
            { key: 'other', label: 'अन्य दस्तावेज' }
          ].map(doc => (
            <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {doc.label}
              </label>
              
              <div className="flex gap-2">
                <label className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-center cursor-pointer hover:bg-green-600 transition-colors">
                  <Upload className="w-4 h-4 inline mr-2" />
                  फाइल चुनें
                  <input
                    ref={el => fileInputRefs.current[doc.key] = el}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                    className="hidden"
                  />
                </label>
                
                <label className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4 inline mr-2" />
                  फोटो लें
                  <input
                    type="file"
                    accept="image/*"
                    capture="camera"
                    onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.documents[doc.key] && (
                <div className="mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {formData.documents[doc.key].name}
                </div>
              )}

              {documentPreviews[doc.key] && (
                <div className="mt-2">
                  <img 
                    src={documentPreviews[doc.key]} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}

              {errors[doc.key] && <ValidationMessage message={errors[doc.key]} />}
            </div>
          ))}
        </div>
      </CardComponent>
    </div>
  );

// Step 4: Lease Terms
const renderLeaseTerms = () => (
  <CardComponent title="लीज की शर्तें" statusColor="border-yellow-200">
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          लीज का प्रकार *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="leaseType"
              value="rent"
              checked={formData.leaseType === 'rent'}
              onChange={(e) => updateFormData('leaseType', e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">किराया</div>
              <div className="text-sm text-gray-600">निर्धारित किराया राशि</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="leaseType"
              value="profit-share"
              checked={formData.leaseType === 'profit-share'}
              onChange={(e) => updateFormData('leaseType', e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">लाभ हिस्सेदारी</div>
              <div className="text-sm text-gray-600">फसल की बिक्री में हिस्सा</div>
            </div>
          </label>
        </div>
        {errors.leaseType && <ValidationMessage message={errors.leaseType} />}
      </div>

      {formData.leaseType === 'rent' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            किराया राशि (प्रति एकड़/वर्ष) *
          </label>
          <input
            type="number"
            value={formData.rentAmount}
            onChange={(e) => updateFormData('rentAmount', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="₹ में राशि दर्ज करें"
          />
          {errors.rentAmount && <ValidationMessage message={errors.rentAmount} />}
        </div>
      )}

      {formData.leaseType === 'profit-share' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            लाभ हिस्सेदारी (%) *
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.profitSharePercentage}
            onChange={(e) => updateFormData('profitSharePercentage', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="लाभ प्रतिशत दर्ज करें"
          />
          {errors.profitSharePercentage && (
            <ValidationMessage message={errors.profitSharePercentage} />
          )}
        </div>
      )}
    </div>
  </CardComponent>
);
