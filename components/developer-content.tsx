"use client"
import { useState } from 'react';
import { Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { authenticatedFetch } from '@/utils/auth';
import { useLanguage } from '@/contexts/language-context';

export default function ApiKeysComponent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Clés API');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [visibilityStates, setVisibilityStates] = useState({
    private: false,
    secret: false
  });

  const [apiKeys, setApiKeys] = useState({
    public: '',
    secret: ''
  });

  const handleRenewKeys = async () => {
    try {
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/generate-api-key`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.public_key && data.secret_key) {
        setApiKeys({ public: data.public_key, secret: data.secret_key });
      } else {
        alert(data.message || data.detail || t("failedToRenewApiKeys"));
      }
    } catch (err) {
      alert(t("failedToRenewApiKeys"));
    }
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Échec de la copie: ', err);
    }
  };

  const toggleVisibility = (key: keyof typeof visibilityStates) => {
    setVisibilityStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '•'.repeat(key.length - 16) + key.substring(key.length - 8);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 ">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black-500 dark:text-white">
            {t("developers")}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[t("apiKeysTab"), t("webhookTab")].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx === 0 ? 'Clés API' : 'Webhook')}
                className={`px-6 py-4 font-medium transition-colors ${
                  (activeTab === 'Clés API' && idx === 0) || (activeTab === 'Webhook' && idx === 1)
                    ? 'border-b-2 border-black text-black bg-gray-50 dark:text-white dark:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Contenu des Clés API */}
          {activeTab === 'Clés API' && (
            <div className="p-6 space-y-6">
              {/* Clé API Publique */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("publicApiKey")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKeys.public}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg border transition-colors bg-gray-50 border-gray-300 text-gray-900 focus:border-black dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                  />
                  <button
                    onClick={() => handleCopy('public', apiKeys.public)}
                    className="px-4 py-3 bg-black text-white rounded-lg hover:bg-grey-600 transition-colors flex items-center gap-2 font-medium"
                  >
                    {copiedStates.public ? <Check size={16} /> : <Copy size={16} />}
                    {copiedStates.public ? t("copied") : t("copy")}
                  </button>
                </div>
              </div>

              {/* Clé Secrète */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("secret")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={visibilityStates.secret ? apiKeys.secret : maskKey(apiKeys.secret)}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg border transition-colors bg-gray-50 border-gray-300 text-gray-900 focus:border-black-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-black-500 focus:outline-none focus:ring-2 focus:ring-black-500 focus:ring-opacity-20"
                  />
                  <button
                    onClick={() => toggleVisibility('secret')}
                    className="px-3 py-3 rounded-lg border transition-colors bg-white border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {visibilityStates.secret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleCopy('secret', apiKeys.secret)}
                    className="px-4 py-3 bg-black text-white rounded-lg hover:bg-black-600 transition-colors flex items-center gap-2 font-medium"
                  >
                    {copiedStates.secret ? <Check size={16} /> : <Copy size={16} />}
                    {copiedStates.secret ? t("copied") : t("copy")}
                  </button>
                </div>
              </div>

              {/* Bouton de Renouvellement */}
              <div className="pt-4">
                <button
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-grey-600 transition-colors flex items-center gap-2 font-medium"
                  onClick={handleRenewKeys}
                  type="button"
                >
                  <RefreshCw size={16} />
                  {t("renewApiKeys")}
                </button>
              </div>
            </div>
          )}

          {/* Contenu Webhook */}
          {activeTab === 'Webhook' && (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>{t("webhookConfigNotice")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Avis de Sécurité */}
        <div className="mt-6 p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <p className="text-sm">
            <strong>{t("securityNoticeTitle")}</strong> {t("securityNotice")}
          </p>
        </div>
      </div>
    </div>
  );
}