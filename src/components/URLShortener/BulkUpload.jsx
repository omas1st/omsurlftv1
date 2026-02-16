// src/components/URLShortener/BulkUpload.jsx
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { urlAPI } from '../../services/api';
import './BulkUpload.css';

const BulkUpload = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const sampleCSV = `long_url,custom_slug,tags
https://example.com/page1,my-page1,marketing
https://example.com/page2,,sales
https://example.com/page3,custom-page3,"marketing,sales"`;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.match(/\.(csv|xlsx?)$/i)) {
      alert('Please upload a CSV or Excel file.');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setResults([]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const validateRow = (row, index) => {
    const rowErrors = [];
    
    // Check if row exists and has data
    if (!row || Object.keys(row).length === 0) {
      rowErrors.push('Empty row');
      return { row: index + 1, errors: rowErrors };
    }
    
    // Check for long_url - it's required
    const longUrl = row.long_url || row.longUrl;
    
    if (!longUrl || typeof longUrl !== 'string' || longUrl.trim() === '') {
      rowErrors.push('Missing URL');
    } else if (!isValidUrl(longUrl.trim())) {
      rowErrors.push('Invalid URL format');
    }

    // Validate custom slug if provided
    const customSlug = row.custom_slug || row.customSlug;
    if (customSlug && customSlug.toString().trim() !== '' && !isValidSlug(customSlug.toString().trim())) {
      rowErrors.push('Invalid slug format (use letters, numbers, hyphens, underscores)');
    }

    return rowErrors.length > 0 ? { row: index + 1, errors: rowErrors } : null;
  };

  const isValidUrl = (string) => {
    if (!string || typeof string !== 'string') return false;
    
    const trimmed = string.trim();
    if (trimmed === '') return false;
    
    try {
      // Add protocol if missing for validation
      let urlToCheck = trimmed;
      if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
        urlToCheck = 'http://' + urlToCheck;
      }
      
      const url = new URL(urlToCheck);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const isValidSlug = (slug) => {
    if (!slug || typeof slug !== 'string') return false;
    const trimmed = slug.trim();
    return /^[a-zA-Z0-9_-]{3,50}$/.test(trimmed);
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setErrors([]);
    setResults([]);

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let data = [];
        
        if (file.name.endsWith('.csv')) {
          const result = Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
            transform: (value, field) => {
              if (value === null || value === undefined) return '';
              return value.toString().trim();
            }
          });
          data = result.data.filter(row => {
            // Filter out rows where all values are empty
            return Object.values(row).some(value => value.toString().trim() !== '');
          });
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
          
          // Clean up Excel data
          data = data.filter(row => {
            return Object.values(row).some(value => 
              value !== null && value !== undefined && value.toString().trim() !== ''
            );
          });
        }

        if (data.length === 0) {
          setErrors([{ 
            row: 'all', 
            errors: ['No valid data found in the file'] 
          }]);
          setLoading(false);
          return;
        }

        // Validate all rows
        const validationErrors = [];
        const validRows = [];

        data.forEach((row, index) => {
          const error = validateRow(row, index);
          if (error) {
            validationErrors.push(error);
          } else {
            // Only add rows that have a URL
            const longUrl = row.long_url || row.longUrl;
            if (longUrl && longUrl.toString().trim() !== '') {
              const customSlug = row.custom_slug || row.customSlug;
              const tags = row.tags || '';
              
              validRows.push({
                long_url: longUrl.toString().trim(),
                custom_slug: customSlug && customSlug.toString().trim() !== '' ? customSlug.toString().trim() : undefined,
                tags: tags ? 
                  (Array.isArray(tags) ? 
                    tags.map(tag => tag.toString().trim()).filter(tag => tag) :
                    tags.toString().split(',').map(tag => tag.trim()).filter(tag => tag)
                  ) : []
              });
            }
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }

        if (validRows.length === 0) {
          setErrors([{ 
            row: 'all', 
            errors: ['No valid URLs found in the file'] 
          }]);
          setLoading(false);
          return;
        }

        try {
          setProgress(30);
          
          // Use the API service
          const response = await urlAPI.bulkShorten({
            urls: validRows
          });

          if (response.data.success) {
            const resultData = response.data.data;
            setResults(resultData.results || []);
            
            // Ensure errors is an array of objects with row and errors properties
            if (resultData.errors) {
              if (Array.isArray(resultData.errors)) {
                // Validate each error object
                const formattedErrors = resultData.errors.map(err => {
                  if (err && typeof err === 'object' && err.row !== undefined && Array.isArray(err.errors)) {
                    return err;
                  } else {
                    // Convert unexpected error format
                    return { row: 'all', errors: [err?.message || String(err) || 'Unknown error'] };
                  }
                });
                setErrors(formattedErrors);
              } else {
                // If errors is not an array, convert to array
                setErrors([{ row: 'all', errors: [resultData.errors?.message || String(resultData.errors) || 'Unknown error'] }]);
              }
            }
            
            setProgress(100);
            
            // Call onComplete callback with all data
            if (onComplete) {
              onComplete({
                success: resultData.successful || resultData.results?.length || 0,
                failed: resultData.failed || (Array.isArray(resultData.errors) ? resultData.errors.length : 0),
                results: resultData.results || [],
                errors: resultData.errors || [],
                total: resultData.total || validRows.length
              });
            }
          } else {
            setErrors([{ 
              row: 'all', 
              errors: [response.data.message || 'Processing error occurred'] 
            }]);
          }
        } catch (error) {
          console.error('API error:', error);
          console.error('Error response:', error.response?.data);
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Failed to process URLs. Please try again.';
          setErrors([{ row: 'all', errors: [errorMessage] }]);
        }

        setLoading(false);

      } catch (error) {
        console.error('Error processing file:', error);
        setErrors([{ 
          row: 'all', 
          errors: ['Failed to process file: ' + error.message] 
        }]);
        setLoading(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_urls.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadResultsCSV = () => {
    if (results.length === 0) return;

    const csvData = [
      ['Row', 'Alias', 'Short URL', 'Analytics URL', 'Long URL', 'Tags'],
      ...results.map((result, index) => [
        result.row || index + 1,
        result.alias,
        result.shortUrl,
        result.analyticsUrl || `${window.location.origin}/${result.alias}/analytics`,
        result.longUrl || '',
        result.tags ? (Array.isArray(result.tags) ? result.tags.join(', ') : result.tags) : ''
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-urls-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bulk-upload">
      <div 
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
        />
        
        {isDragging && (
          <div className="drag-overlay">
            Drop your file here
          </div>
        )}
        
        {file ? (
          <div className="file-selected">
            <span>{file.name}</span>
            <button onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              setResults([]);
              setErrors([]);
            }}>
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <p>Drag & drop your file here</p>
            <p className="file-requirements">
              Supports CSV, XLS, XLSX (Max 5MB)
            </p>
            <button 
              className="browse-btn" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>
          </>
        )}
      </div>

      <div className="sample-section">
        <button onClick={downloadSample} className="sample-btn">
          Download Sample Template
        </button>
      </div>

      {/* Show Generate URLs button immediately after file upload */}
      {file && !loading && results.length === 0 && (
        <div className="generate-section">
          <button 
            onClick={processFile} 
            className="generate-btn"
            disabled={loading}
          >
            Generate URLs
          </button>
          <p className="generate-note">
            Click to process and generate short URLs
          </p>
        </div>
      )}

      {loading && (
        <div className="loading-section">
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="processing-text">
            Processing {progress}%
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="errors-container">
          <h4>Validation Errors</h4>
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              <strong>Row {error.row}:</strong>
              <ul>
                {Array.isArray(error.errors) ? error.errors.map((err, errIndex) => (
                  <li key={errIndex}>{err}</li>
                )) : <li>Unknown error format</li>}
              </ul>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="results-container">
          <div className="results-header">
            <h4>Processing Results</h4>
            <button 
              onClick={downloadResultsCSV} 
              className="download-csv-btn"
              title="Download all generated URLs as CSV"
            >
              📥 Download CSV
            </button>
          </div>
          
          <div className="results-summary">
            <span className="status-indicator success">
              ✓ Successful: {results.length}
            </span>
            {errors.length > 0 && (
              <span className="status-indicator error" style={{ marginLeft: '1rem' }}>
                ✗ Failed: {errors.length}
              </span>
            )}
          </div>
          
          <div className="results-table">
            <div className="table-header">
              <div className="col-alias">Alias</div>
              <div className="col-url">Short URL</div>
              <div className="col-analytics">Analytics</div>
              <div className="col-actions">Actions</div>
            </div>
            
            <div className="table-body">
              {results.slice(0, 20).map((result, index) => (
                <div key={index} className="result-item">
                  <div className="col-alias">
                    <code>{result.alias}</code>
                  </div>
                  <div className="col-url">
                    <a 
                      href={result.shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title={result.longUrl || ''}
                    >
                      {result.shortUrl}
                    </a>
                  </div>
                  <div className="col-analytics">
                    {result.analyticsUrl ? (
                      <a 
                        href={result.analyticsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        📊 View Analytics
                      </a>
                    ) : (
                      <a 
                        href={`${window.location.origin}/${result.alias}/analytics`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        📊 View Analytics
                      </a>
                    )}
                  </div>
                  <div className="col-actions">
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.shortUrl)}
                      className="copy-btn-small"
                      title="Copy short URL"
                    >
                      📋
                    </button>
                    <a 
                      href={result.shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="open-btn"
                      title="Open URL"
                    >
                      🔗
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {results.length > 20 && (
              <div className="table-footer">
                <div className="more-results">
                  + {results.length - 20} more URLs • 
                  <button 
                    onClick={downloadResultsCSV} 
                    className="download-all-link"
                  >
                    Download all ({results.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;