// src/components/Analytics/ExportModal.jsx
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose, selectedUrl, timeRangeLabel }) => {
  const [selectedSections, setSelectedSections] = useState({
    statsChart: true,
    topCountries: true,
    browserUsage: true,
    osUsage: true,
    languages: true,
    hourlyTraffic: true,
    destinationRouting: true,
    recentVisitors: true,
    overviewSummary: true,
  });
  const [exporting, setExporting] = useState(false);

  const sections = [
    { id: 'statsChart', label: 'Visitor Trends', selector: '.stats-chart-section' },
    { id: 'topCountries', label: 'Top Countries', selector: '.top-countries-section' },
    { id: 'browserUsage', label: 'Browser Usage', selector: '.browser-usage-section' },
    { id: 'osUsage', label: 'Operating Systems', selector: '.os-usage-section' },
    { id: 'languages', label: 'Languages', selector: '.language-section' },
    { id: 'hourlyTraffic', label: 'Hourly Traffic', selector: '.hourly-analytics-section' },
    { id: 'destinationRouting', label: 'Destination Routing', selector: '.sankey-section' },
    { id: 'recentVisitors', label: 'Recent Visitors', selector: '.recent-visitors-section' },
    { id: 'overviewSummary', label: 'Overview Summary', selector: '.analytics-overview-section' },
  ];

  const handleSelectAll = () => {
    const all = {};
    sections.forEach((s) => (all[s.id] = true));
    setSelectedSections(all);
  };

  const handleClearAll = () => {
    const none = {};
    sections.forEach((s) => (none[s.id] = false));
    setSelectedSections(none);
  };

  const handleToggle = (id) => {
    setSelectedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generatePDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(18);
      pdf.text(`Analytics Report - ${selectedUrl === 'overall' ? 'Overall' : `/${selectedUrl}`}`, 40, 40);
      pdf.setFontSize(12);
      pdf.text(`Time range: ${timeRangeLabel}`, 40, 70);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 90);

      let yOffset = 120;

      for (const section of sections) {
        if (!selectedSections[section.id]) continue;

        const element = document.querySelector(section.selector);
        if (!element) {
          console.warn(`Element not found for selector: ${section.selector}`);
          continue;
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yOffset + imgHeight > pageHeight - 40) {
          pdf.addPage();
          yOffset = 40;
        }

        pdf.addImage(imgData, 'PNG', 40, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 20;
      }

      pdf.save(`analytics-${selectedUrl}-${Date.now()}.pdf`);

      // Web Share API (best effort)
      if (navigator.share) {
        try {
          const pdfBlob = pdf.output('blob');
          const file = new File([pdfBlob], 'analytics-report.pdf', { type: 'application/pdf' });
          await navigator.share({
            files: [file],
            title: 'Analytics Report',
            text: `Analytics report for ${selectedUrl}`,
          });
        } catch (err) {
          // ignore share errors
        }
      }
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setExporting(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Export Report</h3>
        <p className="modal-subtitle">Select sections to include</p>

        <div className="export-sections-list">
          {sections.map((s) => (
            <label key={s.id} className="export-section-item">
              <input
                type="checkbox"
                checked={selectedSections[s.id] || false}
                onChange={() => handleToggle(s.id)}
              />
              {s.label}
            </label>
          ))}
        </div>

        <div className="export-actions">
          <button type="button" onClick={handleSelectAll}>Select All</button>
          <button type="button" onClick={handleClearAll}>Clear All</button>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button className="export-btn" onClick={generatePDF} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;