'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { whatsappApi, WebhookSettings, WebhookLog, WebhookTestResult } from '@/lib/api';

export default function WebhookPage() {
  const [settings, setSettings] = useState<WebhookSettings>({ webhookUrls: [] });
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await whatsappApi.getWebhookSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        showToast('Failed to load webhook settings', 'error');
      }
    } catch (error) {
      showToast('Error loading webhook settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await whatsappApi.getWebhookLogs();
      
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await whatsappApi.updateWebhookSettings(settings);
      
      if (response.success && response.data) {
        showToast('Webhook settings saved successfully', 'success');
        setSettings(response.data);
      } else {
        showToast(response.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Error saving webhook settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async (url: string) => {
    setTesting(url);
    try {
      const response = await whatsappApi.testWebhook(url);
      
      if (response.success && response.data) {
        const result: WebhookTestResult = response.data;
        if (result.success) {
          showToast(`Webhook test successful (${result.responseTime}ms)`, 'success');
        } else {
          showToast(`Webhook test failed: ${result.error}`, 'error');
        }
      } else {
        showToast(response.error || 'Test failed', 'error');
      }
    } catch (error) {
      showToast('Error testing webhook', 'error');
    } finally {
      setTesting(null);
    }
  };

  const addUrl = () => {
    if (newUrl.trim() && !settings.webhookUrls.includes(newUrl.trim())) {
      setSettings({
        ...settings,
        webhookUrls: [...settings.webhookUrls, newUrl.trim()]
      });
      setNewUrl('');
    }
  };

  const removeUrl = (index: number) => {
    setSettings({
      ...settings,
      webhookUrls: settings.webhookUrls.filter((_, i) => i !== index)
    });
  };

  const clearLogs = async () => {
    try {
      const response = await whatsappApi.clearWebhookLogs();
      
      if (response.success) {
        setLogs([]);
        showToast('Webhook logs cleared', 'success');
      } else {
        showToast('Failed to clear logs', 'error');
      }
    } catch (error) {
      showToast('Error clearing logs', 'error');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Webhook Settings</h1>
        
        {/* Webhook URLs Configuration */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Webhook URLs</h2>
            <p className="text-gray-600 mt-1">
              Configure URLs to receive webhook notifications when messages are received.
            </p>
          </div>
          
          <div className="p-6">
            {/* Add new URL */}
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://your-webhook-url.com/endpoint"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addUrl()}
              />
              <button
                onClick={addUrl}
                disabled={!newUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add URL
              </button>
            </div>

            {/* URL List */}
            <div className="space-y-2 mb-6">
              {settings.webhookUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <span className="flex-1 text-sm font-mono">{url}</span>
                  <button
                    onClick={() => testWebhook(url)}
                    disabled={testing === url}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {testing === url ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => removeUrl(index)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {settings.webhookUrls.length === 0 && (
                <p className="text-gray-500 text-center py-4">No webhook URLs configured</p>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Webhook Delivery Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delivery Logs</h2>
              <p className="text-gray-600 mt-1">
                Recent webhook delivery attempts and their results.
              </p>
            </div>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="p-6">
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">URL</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Response Time</th>
                      <th className="text-left py-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100">
                        <td className="py-2">{formatTimestamp(log.timestamp)}</td>
                        <td className="py-2 font-mono text-xs max-w-xs truncate">{log.url}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              log.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-2">{log.responseTime ? `${log.responseTime}ms` : '-'}</td>
                        <td className="py-2 text-red-600 text-xs max-w-xs truncate">
                          {log.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No delivery logs available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

