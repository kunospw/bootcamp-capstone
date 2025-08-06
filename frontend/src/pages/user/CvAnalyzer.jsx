import React, { useState, useEffect } from 'react'
import NavBar from '../../Components/NavBar'
import Footer from '../../Components/Footer'
import FloatingDecorations from '../../Components/FloatingDecorations'
import { cvAnalyzerAPI } from '../../services/api'

const CvAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [major, setMajor] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load analysis history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await cvAnalyzerAPI.getAnalysisHistory({ limit: 10 });
        setAnalysisHistory(response.data?.docs || []);
      } catch (error) {
        console.error('Failed to load analysis history:', error);
      }
    };
    
    loadHistory();
  }, []);

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setUploadedFile(file);
      setError(null);
      
      // Create URL for PDF preview
      setPdfLoading(true);
      setPdfError(false);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      setError('Please upload a PDF file only');
    }
  };

  // Cleanup URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !experienceLevel || !major) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('cv', uploadedFile);
      formData.append('experienceLevel', experienceLevel);
      formData.append('major', major);
      if (targetJobTitle.trim()) {
        formData.append('targetJobTitle', targetJobTitle.trim());
      }

      // Upload and start analysis
      const uploadResponse = await cvAnalyzerAPI.uploadAndAnalyze(formData);
      const newAnalysisId = uploadResponse.data.analysisId;
      setAnalysisId(newAnalysisId);

      // Poll for results
      const result = await cvAnalyzerAPI.pollAnalysisStatus(newAnalysisId);
      setAnalysisResult(result.data);
      
      // Refresh history
      const historyResponse = await cvAnalyzerAPI.getAnalysisHistory({ limit: 10 });
      setAnalysisHistory(historyResponse.data?.docs || []);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="relative pt-16">
        <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
          <FloatingDecorations />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">CV Analyzer</h1>
            <p className="text-lg text-blue-100">Upload your CV and get AI-powered insights to improve your job application success</p>
          </div>

          <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File Upload - 1/3 width */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Your CV</h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : uploadedFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          if (pdfUrl) {
                            URL.revokeObjectURL(pdfUrl);
                            setPdfUrl(null);
                          }
                          setPdfLoading(false);
                          setPdfError(false);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Drop your CV here</p>
                        <p className="text-xs text-gray-500">PDF only up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="cv-upload"
                      />
                      <label
                        htmlFor="cv-upload"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                      >
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>

                {/* Job Information Form */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
                  <div className="space-y-4">
                    {/* Experience Level */}
                    <div>
                      <label htmlFor="experience-level" className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level *
                      </label>
                      <select
                        id="experience-level"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">Select your experience level</option>
                        <option value="entry">Entry Level (0-2 years)</option>
                        <option value="mid">Mid Level (2-5 years)</option>
                        <option value="senior">Senior Level (5-10 years)</option>
                        <option value="executive">Executive Level (10+ years)</option>
                      </select>
                    </div>

                    {/* Major/Field */}
                    <div>
                      <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
                        Field of Study/Major *
                      </label>
                      <input
                        type="text"
                        id="major"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g., Computer Science, Software Engineering"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>

                    {/* Target Job (Optional) */}
                    <div>
                      <label htmlFor="target-job" className="block text-sm font-medium text-gray-700 mb-2">
                        Target Job Title (Optional)
                      </label>
                      <input
                        type="text"
                        id="target-job"
                        value={targetJobTitle}
                        onChange={(e) => setTargetJobTitle(e.target.value)}
                        placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Specifying a target job title provides more targeted analysis
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || !experienceLevel || !major || isAnalyzing}
                  className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-colors ${
                    !uploadedFile || !experienceLevel || !major || isAnalyzing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing CV...
                    </div>
                  ) : (
                    'Analyze My CV'
                  )}
                </button>
              </div>

              {/* CV Preview - 2/3 width */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">CV Preview</h2>
                
                {uploadedFile ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {uploadedFile.type === 'application/pdf' ? (
                      <div className="h-[600px] bg-gray-100 relative">
                        {pdfLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">Loading PDF...</p>
                            </div>
                          </div>
                        )}
                        {pdfError ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <p className="text-lg text-gray-600 mb-2">PDF Preview</p>
                              <p className="text-sm text-gray-500 mb-4">{uploadedFile.name}</p>
                              <p className="text-xs text-red-600 mb-4">Cannot display PDF in browser</p>
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open PDF in New Tab
                              </a>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            src={pdfUrl}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                            onLoad={() => setPdfLoading(false)}
                            onError={() => {
                              setPdfLoading(false);
                              setPdfError(true);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="CV Preview"
                        className="w-full h-[600px] object-contain bg-gray-100"
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg text-gray-500 mb-2">Upload a CV to see preview</p>
                      <p className="text-sm text-gray-400">Your CV will appear here for review before analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 relative z-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CV Score</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-blue-600">{analysisResult.overallScore}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 mb-4">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.overallScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {analysisResult.overallScore >= 90 ? 'Excellent CV!' : 
                       analysisResult.overallScore >= 75 ? 'Good CV with room for improvement' :
                       analysisResult.overallScore >= 60 ? 'Needs improvement' : 'Significant improvements needed'}
                    </p>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-2">
                  {analysisResult.summary && (
                    <div className="space-y-4">
                      {/* Strengths */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Strengths
                        </h3>
                        <p className="text-sm text-gray-700">{analysisResult.summary.strengths}</p>
                      </div>

                      {/* Areas of Improvement */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-orange-700 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Areas for Improvement
                        </h3>
                        <p className="text-sm text-gray-700">{analysisResult.summary.areasOfImprovement}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detailed Analysis Sections */}
              {analysisResult.sections && (
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
                  {/* ATS Compatibility */}
                  {analysisResult.sections.atsCompatibility && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                        </svg>
                        ATS Compatibility ({analysisResult.sections.atsCompatibility.score}%)
                      </h3>
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        {analysisResult.sections.atsCompatibility.recommendations && (
                          <ul className="space-y-2">
                            {analysisResult.sections.atsCompatibility.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Alignment */}
                  {analysisResult.sections.skillsAlignment && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Skills Alignment ({analysisResult.sections.skillsAlignment.score}%)
                      </h3>
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                        {analysisResult.sections.skillsAlignment.suggestions && (
                          <ul className="space-y-2">
                            {analysisResult.sections.skillsAlignment.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Priority Recommendations
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.recommendations.slice(0, 5).map((recommendation, index) => (
                      <div key={index} className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                                recommendation.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {recommendation.priority} priority
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {recommendation.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{recommendation.suggestion}</p>
                            {recommendation.impact && (
                              <p className="text-xs text-gray-500">Impact: {recommendation.impact}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Insights */}
              {analysisResult.marketInsights && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    Market Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.marketInsights.salaryRange && (
                      <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                        <p className="text-sm text-gray-700">
                          {analysisResult.marketInsights.salaryRange.min?.toLocaleString()} - {analysisResult.marketInsights.salaryRange.max?.toLocaleString()} {analysisResult.marketInsights.salaryRange.currency}
                        </p>
                      </div>
                    )}
                    <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                      <h4 className="font-medium text-gray-900 mb-2">Market Demand</h4>
                      <p className="text-sm text-gray-700 capitalize">{analysisResult.marketInsights.demandLevel}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis History */}
          {showHistory && analysisHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {analysisHistory.map((analysis) => (
                  <div key={analysis._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{analysis.originalFilename}</h3>
                        <p className="text-sm text-gray-500">
                          {analysis.jobData.experienceLevel} • {analysis.jobData.major}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {analysis.overallScore && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {analysis.overallScore}%
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          analysis.processingStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          analysis.processingStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          analysis.processingStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analysis.processingStatus}
                        </span>
                        {analysis.processingStatus === 'completed' && (
                          <button
                            onClick={() => {
                              setAnalysisResult(analysis);
                              setShowHistory(false);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Results
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show History Button */}
          {!showHistory && analysisHistory.length > 0 && (
            <div className="text-center relative z-10">
              <button
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Analysis History ({analysisHistory.length})
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CvAnalyzer;