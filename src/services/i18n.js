import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      'header.login': 'Login',
      'header.register': 'Register',
      'header.dashboard': 'Dashboard',
      'header.logout': 'Logout',
      'header.refer': 'Refer & Earn',
      
      // Footer
      'footer.copyright': '© 2024 Short.ly. All rights reserved.',
      'footer.help': 'Help',
      'footer.helpTitle': 'Need Help?',
      'footer.yourEmail': 'Your Email',
      'footer.emailPlaceholder': 'Enter your email',
      'footer.message': 'Message',
      'footer.messagePlaceholder': 'How can we help you?',
      'footer.send': 'Send Message',
      'footer.cancel': 'Cancel',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success!',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.generate': 'Generate',
      'common.generating': 'Generating...',
      'common.optional': 'Optional',
      'common.required': 'Required',
      'common.advancedFeatures': 'Advanced Features',
      
      // URL Shortener
      'urlShortener.title': 'URL Shortener',
      'urlShortener.destinationUrl': 'Destination URL',
      'urlShortener.customAlias': 'Custom Alias',
      'urlShortener.generateUrl': 'Generate Short URL',
      'urlShortener.bulkUpload': 'Bulk Upload',
      'urlShortener.singleUrl': 'Single URL',
      'urlShortener.error': 'Failed to generate short URL',
      
      // Bulk Upload
      'bulkUpload.dragDrop': 'Drag & drop your CSV/Excel file here',
      'bulkUpload.browse': 'Browse Files',
      'bulkUpload.fileRequirements': 'Max 5MB, CSV or Excel format',
      'bulkUpload.fileTooLarge': 'File is too large (max 5MB)',
      'bulkUpload.invalidFileType': 'Invalid file type. Please upload CSV or Excel file.',
      'bulkUpload.downloadSample': 'Download Sample CSV',
      'bulkUpload.processFile': 'Process File',
      'bulkUpload.processing': 'Processing',
      'bulkUpload.remove': 'Remove',
      'bulkUpload.missingUrl': 'Missing URL',
      'bulkUpload.invalidUrl': 'Invalid URL',
      'bulkUpload.invalidSlug': 'Invalid slug (use only letters, numbers, hyphens, underscores)',
      'bulkUpload.processingError': 'Error processing this row',
      'bulkUpload.fileProcessingError': 'Error processing file',
      'bulkUpload.validationErrors': 'Validation Errors',
      'bulkUpload.row': 'Row',
      'bulkUpload.results': 'Results',
      'bulkUpload.successful': 'Successful',
      'bulkUpload.failed': 'Failed',
      'bulkUpload.more': 'more',
      
      // QR Code
      'qrCode.title': 'QR Code Generator',
      'qrCode.destinationUrl': 'Destination URL',
      'qrCode.customAlias': 'Custom Alias',
      'qrCode.generateQR': 'Generate QR Code',
      'qrCode.customization': 'Customization',
      'qrCode.qrColor': 'QR Color',
      'qrCode.bgColor': 'Background Color',
      'qrCode.addText': 'Add Text',
      'qrCode.textPlaceholder': 'Enter text to display',
      'qrCode.top': 'Top',
      'qrCode.bottom': 'Bottom',
      'qrCode.addLogo': 'Add Logo',
      'qrCode.removeLogo': 'Remove Logo',
      'qrCode.preview': 'Preview',
      'qrCode.copiedToClipboard': 'QR code copied to clipboard',
      'qrCode.error': 'Failed to generate QR code',
      
      // Text Destination
      'textDestination.title': 'Text Destination',
      'textDestination.textContent': 'Text Content',
      'textDestination.words': 'words',
      'textDestination.textPlaceholder': 'Enter your text here (max 1000 words)...',
      'textDestination.customAlias': 'Custom Alias',
      'textDestination.generatePage': 'Generate Text Page',
      'textDestination.customization': 'Customization',
      'textDestination.pageColor': 'Page Color',
      'textDestination.textColor': 'Text Color',
      'textDestination.font': 'Font',
      'textDestination.fontSize': 'Font Size',
      'textDestination.allowResponse': 'Allow Response',
      'textDestination.allowResponseDescription': 'Visitors can reply to your text',
      'textDestination.error': 'Failed to generate text page',
      
      // Advanced Features
      'advancedFeatures.loginRequired': 'Login required to use advanced features',
      'advancedFeatures.expirationDate': 'Expiration Date',
      'advancedFeatures.customDomain': 'Custom Domain',
      
      // Analytics Private
      'analyticsPrivate.title': 'Analytics Privacy',
      'analyticsPrivate.makePrivate': 'Make analytics private',
      'analyticsPrivate.description': 'Only you can view analytics for this URL',
      
      // Password Protection
      'passwordProtection.title': 'Password Protection',
      'passwordProtection.password': 'Password',
      'passwordProtection.confirmPassword': 'Confirm Password',
      'passwordProtection.note': 'Note to visitors',
      'passwordProtection.notePlaceholder': 'Optional note to show on password page',
      
      // Registration
      'registration.title': 'Create Account',
      'registration.username': 'Username',
      'registration.email': 'Email',
      'registration.password': 'Password',
      'registration.confirmPassword': 'Confirm Password',
      'registration.register': 'Register',
      'registration.alreadyHaveAccount': 'Already have an account?',
      'registration.login': 'Login',
      'registration.passwordStrength': 'Password Strength',
      'registration.weak': 'Weak',
      'registration.fair': 'Fair',
      'registration.good': 'Good',
      'registration.strong': 'Strong',
      'registration.error': 'Registration failed',
      
      // Login
      'login.title': 'Login',
      'login.usernameOrEmail': 'Username or Email',
      'login.password': 'Password',
      'login.login': 'Login',
      'login.forgotPassword': 'Forgot Password?',
      'login.noAccount': "Don't have an account?",
      'login.register': 'Register',
      'login.error': 'Invalid credentials',
      
      // Forgot Password
      'forgotPassword.title': 'Reset Password',
      'forgotPassword.username': 'Username',
      'forgotPassword.email': 'Email',
      'forgotPassword.reset': 'Reset Password',
      'forgotPassword.backToLogin': 'Back to Login',
      'forgotPassword.success': 'Reset instructions sent to your email',
      'forgotPassword.error': 'Username and email do not match. Please contact admin.',
      
      // Dashboard
      'dashboard.welcome': 'Welcome',
      'dashboard.coinBalance': 'Coin Balance',
      'dashboard.currentTier': 'Current Tier',
      'dashboard.stats': 'Stats',
      'dashboard.totalUrls': 'Total URLs',
      'dashboard.totalVisitors': 'Total Visitors',
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.analytics': 'Analytics',
      'dashboard.manageUrls': 'Manage URLs',
      'dashboard.recentUrls': 'Recent URLs',
      'dashboard.alias': 'Alias',
      'dashboard.destination': 'Destination',
      'dashboard.visitors': 'Visitors',
      'dashboard.noUrls': 'No URLs generated yet',
      
      // Analytics
      'analytics.title': 'Analytics',
      'analytics.urlSelector': 'Select URL',
      'analytics.overall': 'Overall Analytics',
      'analytics.timeSelector': 'Time Range',
      'analytics.today': 'Today',
      'analytics.yesterday': 'Yesterday',
      'analytics.last7Days': 'Last 7 Days',
      'analytics.last30Days': 'Last 30 Days',
      'analytics.last60Days': 'Last 60 Days',
      'analytics.lastYear': 'Last Year',
      'analytics.customDate': 'Custom Date',
      'analytics.localTime': 'Local Time',
      'analytics.utc': 'UTC',
      'analytics.visitors': 'Visitors',
      'analytics.engagement': 'Engagement',
      'analytics.topCountries': 'Top Countries',
      'analytics.country': 'Country',
      'analytics.percentage': 'Percentage',
      'analytics.noData': 'No data available',
      'analytics.highestCountry': 'Highest Traffic',
      
      // Manage URLs
      'manageUrls.title': 'Manage URLs',
      'manageUrls.allUrls': 'All URLs',
      'manageUrls.analytics': 'Analytics',
      'manageUrls.edit': 'Edit',
      'manageUrls.pause': 'Pause',
      'manageUrls.play': 'Play',
      'manageUrls.delete': 'Delete',
      'manageUrls.customMessage': 'Custom Message',
      'manageUrls.messagePlaceholder': 'Enter message to show when URL is paused',
      'manageUrls.save': 'Save Changes',
      'manageUrls.confirmDelete': 'Are you sure you want to delete this URL?',
      'manageUrls.noUrls': 'No URLs to manage',
      
      // Admin Panel
      'admin.title': 'Admin Panel',
      'admin.userManagement': 'User Management',
      'admin.projectManagement': 'Project Management',
      'admin.totalUsers': 'Total Users',
      'admin.totalUrls': 'Total URLs',
      'admin.totalClicks': 'Total Clicks',
      
      // User Management (Admin)
      'userManagement.title': 'User Management',
      'userManagement.email': 'Email',
      'userManagement.urlsCreated': 'URLs Created',
      'userManagement.totalVisitors': 'Total Visitors',
      'userManagement.actions': 'Actions',
      'userManagement.restrict': 'Restrict',
      'userManagement.edit': 'Edit',
      'userManagement.filterDate': 'Filter by registration date',
      'userManagement.filterUrls': 'Filter by URLs created',
      'userManagement.viewUrls': 'View URLs',
      'userManagement.restrictUser': 'Restrict User',
      'userManagement.confirmRestrict': 'Are you sure you want to restrict this user?',
      'userManagement.restrictReason': 'Restriction Reason',
      'userManagement.notifyUser': 'Notify user via email',
      'userManagement.emailTemplate': 'Email Template',
      
      // Project Management (Admin)
      'projectManagement.title': 'Project Management',
      'projectManagement.allUrls': 'All URLs',
      'projectManagement.shortUrl': 'Short URL',
      'projectManagement.destination': 'Destination',
      'projectManagement.clicks': 'Clicks',
      'projectManagement.owner': 'Owner',
      'projectManagement.restrictUrl': 'Restrict URL',
      'projectManagement.restrictReason': 'Reason for restriction',
      'projectManagement.restricted': 'Restricted',
      'projectManagement.active': 'Active',
      
      // Redirect Page
      'redirect.passwordRequired': 'Password Required',
      'redirect.enterPassword': 'Enter password to access this URL',
      'redirect.submit': 'Submit',
      'redirect.urlPaused': 'URL Paused',
      'redirect.urlRestricted': 'URL Restricted',
      'redirect.urlExpired': 'URL Expired',
      'redirect.redirecting': 'Redirecting...',
      'redirect.invalidUrl': 'Invalid URL',
      
      // Text Page
      'textPage.reply': 'Reply',
      'textPage.send': 'Send',
      'textPage.replyPlaceholder': 'Type your reply...',
      'textPage.replies': 'Replies',
      'textPage.noReplies': 'No replies yet',
      'textPage.replySuccess': 'Reply sent successfully',
      'textPage.replyError': 'Failed to send reply',
      'textPage.viewOnly': 'This page is view-only',
    }
  },
  // Other languages would be added similarly
  es: {
    translation: {
      // Spanish translations...
    }
  },
  fr: {
    translation: {
      // French translations...
    }
  }
  // Add other languages...
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;