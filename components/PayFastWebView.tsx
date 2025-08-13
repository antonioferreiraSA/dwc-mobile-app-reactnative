import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, CheckCircle, XCircle } from 'lucide-react-native';

interface PayFastWebViewProps {
  visible: boolean;
  paymentUrl: string;
  onClose: () => void;
  onSuccess: (paymentId?: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export default function PayFastWebView({
  visible,
  paymentUrl,
  onClose,
  onSuccess,
  onCancel,
  onError,
}: PayFastWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    setCurrentUrl(url);
    
    console.log('PayFast WebView navigation:', url);

    // Don't process PayFast's own URLs (sandbox or live) - including finish URLs
    if (url.includes('payfast.co.za/eng/process') || 
        url.includes('sandbox.payfast.co.za') ||
        url.includes('payment.payfast.io/eng/process/finish')) {
      console.log('PayFast payment page loaded');
      return;
    }

    // Handle PayFast finish URLs - these indicate successful payment
    if (url.includes('payment.payfast.io/eng/process/finish/')) {
      console.log('PayFast payment finished successfully!');
      setLoading(false);
      
      // Extract payment ID from the finish URL
      const finishUrlParts = url.split('/');
      const paymentId = finishUrlParts[finishUrlParts.length - 1];
      
      setTimeout(() => {
        onSuccess(paymentId || undefined);
      }, 1500);
      
      return;
    }

    // Check for success URL patterns - only check for your actual return URLs
    if (url.includes('destinyworshipcentre.co.za/donation-success') || 
        (url.includes('return_url') && !url.includes('payfast.co.za') && !url.includes('payment.payfast.io'))) {
      console.log('Payment successful via return URL!');
      setLoading(false);
      
      // Extract payment ID if available from URL
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const paymentId = urlParams.get('pf_payment_id') || urlParams.get('m_payment_id');
      
      setTimeout(() => {
        onSuccess(paymentId || undefined);
      }, 1000);
      
      return;
    }

    // Check for cancel URL patterns - only check for your actual cancel URLs
    if (url.includes('destinyworshipcentre.co.za/donation-cancelled') || 
        (url.includes('cancel_url') && !url.includes('payfast.co.za') && !url.includes('payment.payfast.io'))) {
      console.log('Payment cancelled');
      setLoading(false);
      setTimeout(() => {
        onCancel();
      }, 1000);
      return;
    }

    // Check for error patterns - be more specific
    if ((url.includes('error') || url.includes('fail')) && 
        !url.includes('payfast.co.za') && 
        !url.includes('payment.payfast.io')) {
      console.log('Payment failed');
      setLoading(false);
      setTimeout(() => {
        onError('Payment failed. Please try again.');
      }, 1000);
      return;
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    // If the error is on a PayFast finish URL, treat it as a successful payment
    if (nativeEvent.url && nativeEvent.url.includes('payment.payfast.io/eng/process/finish/')) {
      console.log('PayFast finish URL error - treating as successful payment');
      setLoading(false);
      
      // Extract payment ID from the finish URL
      const finishUrlParts = nativeEvent.url.split('/');
      const paymentId = finishUrlParts[finishUrlParts.length - 1];
      
      setTimeout(() => {
        onSuccess(paymentId || undefined);
      }, 500);
      
      return;
    }
    
    // For other errors, show the error message
    setLoading(false);
    onError('Failed to load payment page. Please check your internet connection.');
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const getStatusMessage = () => {
    // Only show status messages for your actual return URLs, not PayFast URLs
    if (currentUrl.includes('destinyworshipcentre.co.za/donation-success') || 
        (currentUrl.includes('return_url') && !currentUrl.includes('payfast.co.za'))) {
      return {
        icon: <CheckCircle size={24} color="#10B981" />,
        message: 'Payment Successful!',
        color: '#10B981'
      };
    }
    
    if (currentUrl.includes('destinyworshipcentre.co.za/donation-cancelled') || 
        (currentUrl.includes('cancel_url') && !currentUrl.includes('payfast.co.za'))) {
      return {
        icon: <XCircle size={24} color="#EF4444" />,
        message: 'Payment Cancelled',
        color: '#EF4444'
      };
    }

    if ((currentUrl.includes('error') || currentUrl.includes('fail')) && !currentUrl.includes('payfast.co.za')) {
      return {
        icon: <XCircle size={24} color="#EF4444" />,
        message: 'Payment Failed',
        color: '#EF4444'
      };
    }

    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Status Message */}
        {statusMessage && (
          <View style={[styles.statusContainer, { backgroundColor: `${statusMessage.color}10` }]}>
            <View style={styles.statusContent}>
              {statusMessage.icon}
              <Text style={[styles.statusText, { color: statusMessage.color }]}>
                {statusMessage.message}
              </Text>
            </View>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Loading secure payment page...</Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          onLoadEnd={handleLoadEnd}
          onLoadStart={handleLoadStart}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        />

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityText}>
            🔒 Your payment is processed securely by PayFast
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  webview: {
    flex: 1,
  },
  securityNotice: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
