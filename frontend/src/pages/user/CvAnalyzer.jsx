import React, { useState, useEffect } from 'react'
import NavBar from '../../Components/NavBar'

const CvAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preferredRole, setPreferredRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const handleFileUpload = (file) => {
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setUploadedFile(file);
      
      // Create URL for PDF preview
      if (file.type === 'application/pdf') {
        setPdfLoading(true);
        setPdfError(false);
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
      } else {
        setPdfUrl(null);
        setPdfLoading(false);
        setPdfError(false);
      }
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
    if (!uploadedFile || !preferredRole) return;
    
    setIsAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => {
      setAnalysisResult({
        score: 85,
        strengths: [
          "Strong technical skills section",
          "Relevant work experience",
          "Good education background",
          "Professional formatting"
        ],
        improvements: [
          "Add more quantifiable achievements",
          "Include relevant keywords for the role",
          "Optimize summary section",
          "Add more project details"
        ],
        executiveSummary: "Your CV demonstrates strong technical leadership but lacks market-relevant keywords and quantified achievements. Priority focus: Results documentation and ATS optimization.",
        immediateImpacts: [
          'Add "Kubernetes" and "DevOps" (found in 78% of target roles)',
          'Quantify team leadership: "Led team of X engineers"',
          'Fix ATS parsing issues in contact section'
        ],
        marketPositioning: {
          competitiveFor: "89% of Senior Developer roles in Jakarta",
          salaryPotential: "$85K-$120K (current CV suggests $70K-$95K)",
          strongMatch: "Google, Shopee, Gojek (87% compatibility)"
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CV Analyzer</h1>
          <p className="text-lg text-gray-600">Upload your CV and get AI-powered insights to improve your job application success</p>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                        <p className="text-xs text-gray-500">PDF only up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
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

                {/* Preferred Role - moved under upload */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Position</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="preferred-role" className="block text-sm font-medium text-gray-700 mb-2">
                        What role are you applying for?
                      </label>
                      <input
                        type="text"
                        id="preferred-role"
                        value={preferredRole}
                        onChange={(e) => setPreferredRole(e.target.value)}
                        placeholder="e.g., Frontend Developer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This helps us provide more targeted analysis
                    </p>
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || !preferredRole || isAnalyzing}
                  className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-colors ${
                    !uploadedFile || !preferredRole || isAnalyzing
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

          {/* Analysis Results - moved to bottom */}
          {analysisResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CV Score</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-blue-600">{analysisResult.score}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 mb-4">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {analysisResult.score >= 90 ? 'Excellent CV!' : 
                       analysisResult.score >= 75 ? 'Good CV with room for improvement' :
                       analysisResult.score >= 60 ? 'Needs improvement' : 'Significant improvements needed'}
                    </p>
                  </div>
                </div>

                {/* Strengths and Improvements */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Strengths
                    </h3>
                    <ul className="space-y-3">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Keywords Analysis */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    EXECUTIVE SUMMARY
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysisResult.executiveSummary}
                    </p>
                  </div>
                </div>

                {/* Immediate Impact Opportunities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    IMMEDIATE IMPACT OPPORTUNITIES
                  </h3>
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <ol className="space-y-2">
                      {analysisResult.immediateImpacts.map((impact, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 text-xs font-bold rounded-full mr-3 flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{impact}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Market Positioning */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    MARKET POSITIONING
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Competitive for: </span>
                          <span className="text-sm text-gray-700">{analysisResult.marketPositioning.competitiveFor}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Salary potential: </span>
                          <span className="text-sm text-gray-700">{analysisResult.marketPositioning.salaryPotential}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Strong match for: </span>
                          <span className="text-sm text-gray-700">{analysisResult.marketPositioning.strongMatch}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CvAnalyzer