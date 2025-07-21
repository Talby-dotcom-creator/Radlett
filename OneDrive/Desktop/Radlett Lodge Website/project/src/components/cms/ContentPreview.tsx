import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import Button from '../Button';

interface ContentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  contentType: 'event' | 'news' | 'officer' | 'testimonial' | 'faq' | 'page_content';
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ isOpen, onClose, content, contentType }) => {
  if (!isOpen || !content) return null;

  const renderPreview = () => {
    switch (contentType) {
      case 'event':
        return (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-primary-600 mb-2">{content.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                <span>{new Date(content.event_date).toLocaleDateString()}</span>
                <span>{new Date(content.event_date).toLocaleTimeString()}</span>
                <span>{content.location}</span>
              </div>
              {content.is_members_only && (
                <span className="inline-block bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded mb-3">
                  Members Only
                </span>
              )}
              <p className="text-neutral-700">{content.description}</p>
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="space-y-4">
            {content.image_url && (
              <img 
                src={content.image_url} 
                alt={content.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-2">{content.title}</h3>
              <p className="text-neutral-600 mb-3">{content.summary}</p>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </div>
          </div>
        );

      case 'officer':
        return (
          <div className="text-center space-y-4">
            {content.image_url && (
              <img 
                src={content.image_url} 
                alt={content.full_name}
                className="w-32 h-32 object-cover rounded-full mx-auto"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-primary-600">{content.full_name}</h3>
              <p className="text-neutral-600">{content.position}</p>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-neutral-700 italic mb-4">"{content.content}"</p>
              <div className="flex items-center">
                {content.image_url && (
                  <img 
                    src={content.image_url} 
                    alt={content.member_name}
                    className="w-12 h-12 object-cover rounded-full mr-3"
                  />
                )}
                <div>
                  <p className="font-semibold text-primary-600">{content.member_name}</p>
                  <p className="text-sm text-neutral-500">Member</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-600 mb-3">{content.question}</h3>
              <p className="text-neutral-700">{content.answer}</p>
            </div>
          </div>
        );

      case 'page_content':
        return (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-primary-600">{content.page_name}</span>
                <span className="text-neutral-400">→</span>
                <span className="text-sm text-neutral-600">{content.section_name}</span>
                <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                  {content.content_type}
                </span>
              </div>
              {content.content_type === 'html' ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              ) : content.content_type === 'json' ? (
                <pre className="bg-neutral-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(JSON.parse(content.content), null, 2)}
                </pre>
              ) : (
                <p className="text-neutral-700">{content.content}</p>
              )}
            </div>
          </div>
        );

      default:
        return <p>Preview not available for this content type.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-primary-600">Content Preview</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <ExternalLink size={16} className="mr-1" />
              View Live
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;