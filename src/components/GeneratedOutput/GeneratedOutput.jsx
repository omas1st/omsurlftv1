// src/components/GeneratedOutput/GeneratedOutput.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCode } from 'react-qr-code';
import './GeneratedOutput.css';

const GeneratedOutput = ({ data, onNew, onDownload, onShare, qrRef }) => {
  const [copied, setCopied] = useState(false);

  // Local refs for converting SVG -> PNG
  const svgWrapperRef = useRef(null);
  const svgRef = useRef(null);
  const [qrPngDataUrl, setQrPngDataUrl] = useState(null);

  // Prevent concurrent share/download operations
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOutputType = () => {
    if (data?.type === 'bulk') return 'bulk';
    if (data?.qrData) return 'qr';
    if (data?.textPage) return 'text';
    return 'url';
  };

  const outputType = getOutputType();

  // Helper: convert SVG element to PNG data URL
  const convertSvgElementToPng = useCallback(async (svgElement, size = 400) => {
    if (!svgElement) throw new Error('No SVG element provided');

    // Serialize SVG
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    // Ensure namespaces exist
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!svgString.includes('xmlns:xlink')) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // White background so PNG isn't transparent
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(url);
    }
  }, []);

  // Helper: fetch external image and convert to data URL (used as fallback if SVG->PNG fails)
  const fetchUrlToDataUrl = useCallback(async (url) => {
    if (!url) return null;
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      return null;
    }
  }, []);

  // Helper: fetch URL and return blob (better for downloads)
  const fetchUrlToBlob = useCallback(async (url) => {
    if (!url) return null;
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return blob;
    } catch (err) {
      return null;
    }
  }, []);

  // Build the png data URL whenever relevant things change
  useEffect(() => {
    let cancelled = false;
    const runConversion = async () => {
      try {
        if (data?.qrData) {
          if (!cancelled) setQrPngDataUrl(data.qrData);
          return;
        }

        // find SVG: prefer externally passed qrRef, then local svgWrapperRef
        let svgElement = null;
        if (qrRef && qrRef.current) {
          svgElement =
            qrRef.current.querySelector && qrRef.current.querySelector('svg')
              ? qrRef.current.querySelector('svg')
              : qrRef.current;
        }
        if (!svgElement && svgWrapperRef.current) {
          svgElement = svgWrapperRef.current.querySelector('svg');
        }
        if (!svgElement && svgRef.current) {
          svgElement = svgRef.current;
        }

        if (svgElement) {
          try {
            const targetSize = data?.customization?.size || 400;
            const png = await convertSvgElementToPng(svgElement, targetSize);
            if (!cancelled) {
              setQrPngDataUrl(png);
              return;
            }
          } catch (err) {
            // conversion failed (often due to external images / CORS), fall through to fallback
          }
        }

        // fallback: if we have a stored QR image URL (server upload), fetch it and convert to data URL
        if (data?.qrImageUrl) {
          const fetched = await fetchUrlToDataUrl(data.qrImageUrl);
          if (fetched && !cancelled) {
            setQrPngDataUrl(fetched);
            return;
          }
        }

        // Last resort: clear
        if (!cancelled) setQrPngDataUrl(null);
      } finally {
        // no-op
      }
    };

    runConversion();
    return () => {
      cancelled = true;
    };
  }, [data, qrRef, convertSvgElementToPng, fetchUrlToDataUrl]);

  // Download handler (internal). Will also call the provided onDownload prop (if any) with useful payload.
  const handleDownload = async (format = 'png') => {
    if (isDownloading) return; // prevent concurrent downloads
    setIsDownloading(true);
    try {
      // Prefer: data URL (qrPngDataUrl or data.qrData). Otherwise fetch remote blob and download.
      let dataUrl = qrPngDataUrl || data?.qrData || null;

      // If we already have a data URL, use it directly for download.
      if (dataUrl && dataUrl.startsWith('data:')) {
        // Inform parent if provided
        if (onDownload && typeof onDownload === 'function') {
          try {
            await onDownload({ dataUrl, format, alias: data?.alias });
          } catch (err) {
            // ignore parent errors
          }
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        const ext = format === 'svg' ? 'svg' : 'png';
        link.download = data?.alias ? `qrcode-${data.alias}.${ext}` : `qrcode.${ext}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // Otherwise, try to fetch a blob from qrImageUrl or a remote dataUrl (http(s) link)
      const remoteUrl = data?.qrImageUrl || (dataUrl && dataUrl.startsWith('http') ? dataUrl : null);
      if (remoteUrl) {
        const blob = await fetchUrlToBlob(remoteUrl);
        if (blob) {
          // Inform parent if provided (pass blob and a dataUrl created)
          const objectUrl = URL.createObjectURL(blob);
          if (onDownload && typeof onDownload === 'function') {
            try {
              // convert blob to dataUrl for parent convenience (async)
              const reader = new FileReader();
              reader.onloadend = () => {
                try {
                  onDownload({ dataUrl: reader.result, format, alias: data?.alias, blob });
                } catch (e) {
                  // ignore
                }
              };
              reader.readAsDataURL(blob);
            } catch (err) {
              // ignore parent errors
            }
          }

          const link = document.createElement('a');
          link.href = objectUrl;
          const ext = format === 'svg' ? 'svg' : 'png';
          link.download = data?.alias ? `qrcode-${data.alias}.${ext}` : `qrcode.${ext}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          // cleanup
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          return;
        }
      }

      // As a last fallback, if we have any URL (even remote), open it in a new tab to let user save manually.
      if (data?.qrImageUrl) {
        window.open(data.qrImageUrl, '_blank', 'noopener');
      } else {
        // nothing to download
        // eslint-disable-next-line no-console
        console.warn('No QR image available to download');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Download error', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Share handler using Web Share API where available.
  const handleShare = async () => {
    if (isSharing) return; // prevent concurrent shares
    setIsSharing(true);
    try {
      // Get a blob to share (preferred). If we have data URL, convert to blob; otherwise fetch qrImageUrl.
      let dataUrl = qrPngDataUrl || data?.qrData || null;
      let blob = null;

      if (dataUrl && dataUrl.startsWith('data:')) {
        // Convert data URL to blob
        const res = await fetch(dataUrl);
        blob = await res.blob();
      } else if (data?.qrImageUrl) {
        // Fetch remote image as blob
        blob = await fetchUrlToBlob(data.qrImageUrl);
      } else if (dataUrl && dataUrl.startsWith('http')) {
        // dataUrl is remote http link
        blob = await fetchUrlToBlob(dataUrl);
      }

      // Prepare file if we have blob
      let file;
      if (blob) {
        file = new File([blob], data?.alias ? `qrcode-${data.alias}.png` : 'qrcode.png', { type: blob.type });
      }

      // If parent provided an onShare handler, call it and RETURN to avoid double-sharing.
      if (onShare && typeof onShare === 'function') {
        try {
          // await in case parent returns a promise
          await onShare({ file, dataUrl: blob ? undefined : dataUrl, alias: data?.alias });
        } catch (err) {
          // ignore parent's errors
          // eslint-disable-next-line no-console
          console.error('onShare handler threw:', err);
        } finally {
          setIsSharing(false);
        }
        return;
      }

      // Use Web Share API when possible
      if (navigator.canShare && file && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'QR Code',
            text: data?.shortUrl || '',
          });
          return;
        } catch (err) {
          // If share failed, handle gracefully (don't throw uncaught)
          // Some browsers will throw InvalidStateError if an earlier share hasn't finished.
          // We'll catch and log it without letting it crash the app.
          // eslint-disable-next-line no-console
          console.error('navigator.share (files) failed:', err);
        }
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'QR Code',
            text: data?.shortUrl || '',
            url: data?.shortUrl || undefined,
          });
          return;
        } catch (err) {
          // silence InvalidStateError and other share errors to avoid uncaught runtime error
          // eslint-disable-next-line no-console
          console.error('navigator.share failed:', err);
          return;
        }
      }

      // Fallback: open the image in a new tab (user can long-press/save on mobile)
      let openUrl = null;
      if (dataUrl && dataUrl.startsWith('data:')) openUrl = dataUrl;
      else if (data?.qrImageUrl) openUrl = data.qrImageUrl;

      if (openUrl) {
        const w = window.open();
        if (w) {
          w.document.write(`<img src="${openUrl}" alt="QR Code" style="max-width:100%;height:auto" />`);
          w.document.title = 'QR Code';
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Share error', err);
    } finally {
      setIsSharing(false);
    }
  };

  // ===== NEW: Bulk CSV download handler =====
  const handleBulkDownload = () => {
    const results = data?.results || [];
    if (results.length === 0) {
      alert('No results to download');
      return;
    }

    try {
      // Build CSV data
      const csvData = [
        ['Row', 'Alias', 'Short URL', 'Analytics URL', 'Long URL', 'Tags'],
        ...results.map((result, index) => [
          result.row || index + 1,
          result.alias || '',
          result.shortUrl || '',
          result.analyticsUrl || (result.alias ? `${window.location.origin}/${result.alias}/analytics` : ''),
          result.longUrl || '',
          result.tags ? (Array.isArray(result.tags) ? result.tags.join(', ') : result.tags) : ''
        ])
      ];

      // Convert to CSV string with proper escaping
      const csvContent = csvData.map(row => 
        row.map(cell => {
          const cellStr = cell === null || cell === undefined ? '' : String(cell);
          return `"${cellStr.replace(/"/g, '""')}"`;
        }).join(',')
      ).join('\n');

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-urls-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating CSV download:', error);
      alert('Failed to download CSV. Please check console for details.');
    }
  };

  // Render helpers

  const renderURLOutput = () => (
    <div className="output-container">
      <h3>Success</h3>
      <div className="output-section">
        <label>Short URL</label>
        <div className="url-display">
          <a href={data.shortUrl} target="_blank" rel="noopener noreferrer">
            {data.shortUrl}
          </a>
          <button
            onClick={() => copyToClipboard(data.shortUrl)}
            className="copy-btn"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="output-section">
        <label>Analytics URL</label>
        <div className="url-display">
          <a href={data.analyticsUrl} target="_blank" rel="noopener noreferrer">
            {data.analyticsUrl}
          </a>
          <button
            onClick={() => copyToClipboard(data.analyticsUrl)}
            className="copy-btn"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderQROutput = () => (
    <div className="output-container">
      <h3>QR Code Generated</h3>
      <div className="qr-output-section">
        <div
          className="qr-display"
          ref={(node) => {
            svgWrapperRef.current = node;
            if (qrRef) {
              if (typeof qrRef === 'function') qrRef(node);
              else qrRef.current = node;
            }
          }}
        >
          {data.qrData ? (
            <img src={data.qrData} alt="QR Code" className="qr-image" />
          ) : qrPngDataUrl ? (
            <img src={qrPngDataUrl} alt="QR Code" className="qr-image" />
          ) : (
            <div ref={svgRef} aria-hidden>
              <QRCode
                value={data.shortUrl}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
              />
            </div>
          )}
        </div>

        <div className="qr-info">
          <div className="url-display">
            <a href={data.shortUrl} target="_blank" rel="noopener noreferrer">
              {data.shortUrl}
            </a>
            <button
              onClick={() => copyToClipboard(data.shortUrl)}
              className="copy-btn"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="qr-actions">
            <button
              onClick={() => handleDownload('png')}
              className="download-btn"
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download QR'}
            </button>
            <button
              onClick={handleShare}
              className="share-btn"
              disabled={isSharing}
            >
              {isSharing ? 'Sharing...' : 'Share QR'}
            </button>
          </div>

          <div className="analytics-link">
            <a href={data.analyticsUrl} target="_blank" rel="noopener noreferrer">
              View Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBulkOutput = () => (
    <div className="output-container">
      <h3>Bulk Upload Results</h3>
      <div className="bulk-summary">
        <p>Successful: <strong>{data.success}</strong></p>
        <p>Failed: <strong>{data.failed}</strong></p>
      </div>

      <div className="bulk-results">
        <h4>Generated URLs</h4>
        <div className="results-table">
          <div className="table-header">
            <div>Alias</div>
            <div>Short URL</div>
            <div>Actions</div>
          </div>
          {data.results.slice(0, 10).map((result, index) => (
            <div key={index} className="table-row">
              <div>{result.alias}</div>
              <div>
                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                  {result.shortUrl}
                </a>
              </div>
              <div className="row-actions">
                <button onClick={() => copyToClipboard(result.shortUrl)}>
                  Copy
                </button>
                <a href={`${result.shortUrl}/analytics`} target="_blank" rel="noopener noreferrer">
                  Analytics
                </a>
              </div>
            </div>
          ))}
        </div>

        {data.results.length > 10 && (
          <p className="more-results">
            + {data.results.length - 10} more
          </p>
        )}

        {/* FIXED: Added onClick handler */}
        <button className="download-csv-btn" onClick={handleBulkDownload}>
          Download CSV
        </button>
      </div>
    </div>
  );

  const renderTextOutput = () => {
    // Construct analytics URL: use data.analyticsUrl if provided, else build from shortUrl
    const analyticsUrl = data.analyticsUrl || (data.shortUrl ? `${data.shortUrl}/analytics` : '');

    return (
      <div className="output-container">
        <h3>Text Page Created</h3>
        <div className="text-output-section">
          <div className="text-preview">
            <h4>Preview</h4>
            <div
              className="text-page-preview"
              style={{
                backgroundColor: data.customization?.pageColor || '#FFFFFF',
                color: data.customization?.textColor || '#000000',
                fontFamily: data.customization?.textFont || 'Arial',
                fontSize: `${data.customization?.textSize || 16}px`,
                padding: `${data.customization?.padding || 20}px`,
                lineHeight: data.customization?.lineHeight || 1.5,
                textAlign: data.customization?.textAlignment || 'left',
                borderRadius: data.customization?.borderRadius ? `${data.customization.borderRadius}px` : '0',
                boxShadow: data.customization?.boxShadow ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <div className="text-content">
                {data.textContent || data.text}
              </div>
              {data.customization?.allowResponse && (
                <div className="response-indicator">
                  Allow Response ✓
                </div>
              )}
            </div>
          </div>

          <div className="text-info">
            <div className="output-section">
              <label>Short URL</label>
              <div className="url-display">
                <a href={data.shortUrl} target="_blank" rel="noopener noreferrer">
                  {data.shortUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(data.shortUrl)}
                  className="copy-btn"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="output-section">
              <label>Analytics URL</label>
              <div className="url-display">
                <a href={analyticsUrl} target="_blank" rel="noopener noreferrer">
                  {analyticsUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(analyticsUrl)}
                  className="copy-btn"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="qr-section">
              <h5>QR Code</h5>
              {data.qrData ? (
                <img src={data.qrData} alt="QR Code" />
              ) : qrPngDataUrl ? (
                <img src={qrPngDataUrl} alt="QR Code" />
              ) : (
                <QRCode
                  value={data.shortUrl}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                />
              )}
              <div className="qr-actions">
                <button onClick={() => handleDownload('png')} disabled={isDownloading}>
                  {isDownloading ? 'Downloading...' : 'Download QR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOutput = () => {
    switch (outputType) {
      case 'qr':
        return renderQROutput();
      case 'bulk':
        return renderBulkOutput();
      case 'text':
        return renderTextOutput();
      default:
        return renderURLOutput();
    }
  };

  return (
    <div className="generated-output">
      {renderOutput()}
      <div className="output-actions">
        <button onClick={onNew} className="new-btn">
          Create New
        </button>
        {outputType === 'url' && (
          <a href={data.analyticsUrl} target="_blank" rel="noopener noreferrer" className="analytics-btn">
            View Analytics
          </a>
        )}
        {outputType === 'text' && (
          <a href={data.analyticsUrl || `${data.shortUrl}/analytics`} target="_blank" rel="noopener noreferrer" className="analytics-btn">
            View Analytics
          </a>
        )}
      </div>
    </div>
  );
};

export default GeneratedOutput;