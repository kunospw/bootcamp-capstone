// API configuration and utility functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with authentication
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Create FormData headers with authentication
const createFormDataHeaders = (includeAuth = true) => {
  const headers = {};
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// CV Analyzer API functions
export const cvAnalyzerAPI = {
  // Upload and analyze CV
  uploadAndAnalyze: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv-analyzer/upload`, {
        method: 'POST',
        headers: createFormDataHeaders(),
        body: formData,
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('CV upload error:', error);
      throw error;
    }
  },

  // Get analysis results
  getAnalysisResults: async (analysisId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv-analyzer/results/${analysisId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Get results error:', error);
      throw error;
    }
  },

  // Get analysis history
  getAnalysisHistory: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/cv-analyzer/history?${searchParams}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  },

  // Reanalyze CV
  reanalyzeCV: async (analysisId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv-analyzer/reanalyze/${analysisId}`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Reanalyze error:', error);
      throw error;
    }
  },

  // Delete analysis
  deleteAnalysis: async (analysisId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv-analyzer/${analysisId}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Delete analysis error:', error);
      throw error;
    }
  },

  // Get health status
  getHealthStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv-analyzer/health`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Poll for analysis results (for checking if analysis is complete)
  pollAnalysisStatus: async (analysisId, maxAttempts = 30, interval = 5000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await cvAnalyzerAPI.getAnalysisResults(analysisId);
        
        if (result.data.processingStatus === 'completed') {
          return result;
        } else if (result.data.processingStatus === 'failed') {
          throw new Error('Analysis failed on server');
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Wait before retry on error
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Analysis timed out');
  }
};

// Job API functions (for getting job data)
export const jobAPI = {
  // Get all jobs
  getAllJobs: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/jobs?${searchParams}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Get jobs error:', error);
      throw error;
    }
  },

  // Get job by ID
  getJobById: async (jobId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Get job error:', error);
      throw error;
    }
  }
};

export default { cvAnalyzerAPI, jobAPI };
