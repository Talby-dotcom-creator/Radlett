import React, { useState, useEffect } from 'react';

interface ShareModalProps {
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isTemporaryUrl, setIsTemporaryUrl] = useState(false);

  // Initialize with current browser URL on mount
  useEffect(() => {
    const currentUrl = window.location.href;
    setShareUrl(currentUrl);

    // Check if the URL is likely temporary or local
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      protocol === 'file:' || 
      protocol === 'blob:' ||
      hostname.includes('stackblitz') || 
      hostname.includes('webcontainer')
    ) {
      setIsTemporaryUrl(true);
    }
  }, []);
  
  // The code snippet to put on another website, dynamically updating based on the input
  const iframeCode = `<iframe src="${shareUrl}" width="100%" height="800" style="border:none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`;

  const copyToClipboard = (text: string, type: 'LINK' | 'EMBED') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'LINK') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share & Embed
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Warning for Temporary URLs */}
        {isTemporaryUrl && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold block">App Not Published Yet</span>
                You are currently running this app privately (Localhost or Preview). 
                To share it with the LOI Diary, you must <strong>publish/host</strong> this code first (e.g. on Vercel, Netlify, or GitHub Pages) to get a real <code>https://...</code> link.
              </div>
            </div>
          </div>
        )}
        
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            You can share this calendar directly with Brethren or embed it into your own Lodge website using the tools below. 
            <br/><span className="text-slate-400 text-xs italic">Ensure the URL below matches your real, published website address.</span>
        </p>

        <div className="overflow-y-auto pr-2 space-y-6">
            {/* Direct Link Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Public URL (Editable)</label>
                <div className="flex gap-2">
                    <input 
                        value={shareUrl} 
                        onChange={(e) => setShareUrl(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="https://www.your-lodge-website.com/calendar"
                    />
                    <button 
                        onClick={() => copyToClipboard(shareUrl, 'LINK')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[80px] ${
                            copiedLink 
                            ? "bg-green-600 text-white shadow-sm" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        }`}
                    >
                        {copiedLink ? "Copied!" : "Copy"}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Use this link for emails or WhatsApp.</p>
            </div>

            {/* Embed Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Website Embed Code</label>
                <div className="relative">
                    <textarea 
                        readOnly 
                        value={iframeCode} 
                        className="w-full h-24 bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-mono text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={() => copyToClipboard(iframeCode, 'EMBED')}
                        className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium shadow-sm transition-all duration-200 ${
                            copiedEmbed
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                        {copiedEmbed ? "Copied!" : "Copy Code"}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    Paste this code into the HTML of your website to display the calendar inside a frame.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;