import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import URLShortener from '../URLShortener/URLShortener';
import QRCodeShortener from '../QRCodeShortener/QRCodeShortener';
import TextDestination from '../TextDestination/TextDestination';
import Tabs from '../Tabs/Tabs';
import './Body.css';

const Body = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('url');

  const tabs = [
    { id: 'url', label: t('urlShortener.title'), component: URLShortener },
    { id: 'qr', label: t('qrCode.title'), component: QRCodeShortener },
    { id: 'text', label: t('textDestination.title'), component: TextDestination }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="body-container">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default Body;