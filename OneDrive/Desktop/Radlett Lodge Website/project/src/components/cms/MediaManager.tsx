import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, File, Trash2, Copy, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../Button';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: string;
  path: string; // Storage path in Supabase
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (url: string) => void;
  allowMultiple?: boolean;
}

const STORAGE_BUCKET = 'cms-media'; // You'll need to create this bucket in Supabase
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const MediaManager: React.FC<MediaManagerProps> = ({ 
  isOpen, 
  onClose, 
  onSelectMedia, 
  allowMultiple = false 
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'documents'>('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load media files from Supabase Storage
  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 MediaManager: Starting to load files from bucket:', STORAGE_BUCKET);

      // First, check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage
        .listBuckets();
      
      console.log('📦 MediaManager: Available buckets:', buckets);
      
      if (bucketsError) {
        console.error('❌ MediaManager: Error listing buckets:', bucketsError);
        throw new Error(`Failed to list buckets: ${bucketsError.message}`);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
      if (!bucketExists) {
        console.error('❌ MediaManager: Bucket does not exist:', STORAGE_BUCKET);
        throw new Error(`Storage bucket '${STORAGE_BUCKET}' does not exist`);
      }

      const { data: files, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      console.log('📁 MediaManager: Raw Supabase response:', { files, listError });

      if (listError) {
        console.error('❌ MediaManager: List error:', listError);
        throw new Error(`Failed to load files: ${listError.message}`);
      }

      if (!files) {
        console.warn('⚠️ MediaManager: No files returned from Supabase');
        setMediaItems([]);
        return;
      }

      console.log('📋 MediaManager: Files before filtering:', files);
      
      const filteredFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder');
      console.log('📋 MediaManager: Files after filtering:', filteredFiles);
      // Convert Supabase files to MediaItem format
      const mediaItems: MediaItem[] = await Promise.all(
        filteredFiles
          .map(async (file) => {
            console.log('🔄 MediaManager: Processing file:', file);
            
            // Get public URL for the file
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(file.name);

            console.log('🔗 MediaManager: URL data for', file.name, ':', urlData);
            // Determine file type based on extension
            const extension = file.name.split('.').pop()?.toLowerCase() || '';
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            const type = imageExtensions.includes(extension) ? 'image' : 'document';

            const mediaItem = {
              id: file.id || file.name,
              name: file.name,
              url: urlData.publicUrl,
              type,
              size: file.metadata?.size || 0,
              uploadedAt: file.created_at || new Date().toISOString(),
              path: file.name
            };
            
            console.log('📄 MediaManager: Created MediaItem:', mediaItem);
            return mediaItem;
          })
      );

      console.log('✅ MediaManager: Final media items array:', mediaItems);
      setMediaItems(mediaItems);
    } catch (err) {
      console.error('Error loading media files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  // Load files when component opens
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 MediaManager: Component opened, loading files...');
      loadMediaFiles();
    }
    
    // Cleanup function
    return () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear upload progress
      setUploadProgress({});
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear selected items
      setSelectedItems([]);
      
      // Clear error state
      setError(null);
    };
  }, [isOpen]);

  // Generate unique filename to avoid conflicts
  const generateUniqueFilename = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const uniqueName = `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
    console.log('📝 MediaManager: Generated unique filename:', originalName, '->', uniqueName);
    return uniqueName;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Create new abort controller for this upload session
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    console.log('📤 MediaManager: Starting upload for', files.length, 'files');
    setUploading(true);
    setError(null);
    const newUploadProgress: { [key: string]: number } = {};

    try {
      // Check if bucket exists before uploading
      const { data: buckets, error: bucketsError } = await supabase.storage
        .listBuckets();
      
      if (bucketsError) {
        console.error('❌ MediaManager: Error checking buckets:', bucketsError);
        throw new Error(`Failed to check buckets: ${bucketsError.message}`);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
      if (!bucketExists) {
        console.error('❌ MediaManager: Bucket does not exist for upload:', STORAGE_BUCKET);
        throw new Error(`Storage bucket '${STORAGE_BUCKET}' does not exist. Please create it first.`);
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        console.log('📁 MediaManager: Processing file for upload:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          console.error('❌ MediaManager: File too large:', file.name, file.size);
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
          console.error('❌ MediaManager: Invalid file type:', file.type);
          throw new Error(`File type "${file.type}" is not supported.`);
        }

        const uniqueFilename = generateUniqueFilename(file.name);
        newUploadProgress[uniqueFilename] = 0;
        setUploadProgress({ ...newUploadProgress });

        console.log('⬆️ MediaManager: Uploading to bucket:', STORAGE_BUCKET, 'with filename:', uniqueFilename);
        console.log('🔍 MediaManager: Starting to load files from bucket:', STORAGE_BUCKET);
        // Upload file to Supabase Storage
        const uploadResult = await Promise.race([
          supabase.storage
          .from(STORAGE_BUCKET)
          .upload(uniqueFilename, file, {
            cacheControl: '3600',
            upsert: false
          }),
          new Promise((_, reject) => {
            signal.addEventListener('abort', () => reject(new Error('Upload cancelled')));
          })
        ]);

        const { data, error: uploadError } = uploadResult;
        
        console.log('📤 MediaManager: Upload result for', uniqueFilename, ':', { data, uploadError });
        if (uploadError) {
          console.error('❌ MediaManager: Upload failed for', uniqueFilename, ':', uploadError);
          throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
        }

        newUploadProgress[uniqueFilename] = 100;
        setUploadProgress({ ...newUploadProgress });

        console.log('✅ MediaManager: Successfully uploaded:', uniqueFilename);
        return data;
      });

      await Promise.all(uploadPromises);
      console.log('🎉 MediaManager: All uploads completed, reloading file list...');

      // Add a longer delay before reloading the file list to allow Supabase to process the uploads
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Reload the media list to show new files
      await loadMediaFiles();

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress({});
      abortControllerRef.current = null;
    }
  };

  // Handle item selection
  const handleSelectItem = (id: string) => {
    if (allowMultiple) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setSelectedItems([id]);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Delete file from storage
  const handleDeleteItem = async (id: string) => {
    const item = mediaItems.find(item => item.id === id);
    if (!item) return;

    try {
      setError(null);

      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([item.path]);

      if (deleteError) {
        throw new Error(`Failed to delete file: ${deleteError.message}`);
      }

      // Remove from local state
      setMediaItems(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(item => item !== id));

    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  // Handle select and close
  const handleSelectAndClose = () => {
    if (selectedItems.length > 0 && onSelectMedia) {
      const selectedItem = mediaItems.find(item => item.id === selectedItems[0]);
      if (selectedItem) {
        onSelectMedia(selectedItem.url);
      }
    }
    onClose();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter items
  const filteredItems = mediaItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.type === 'image';
    if (filter === 'documents') return item.type === 'document';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-primary-600">Media Manager</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMediaFiles}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                uploading 
                  ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed' 
                  : 'border-neutral-300 hover:border-secondary-500'
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${uploading ? 'text-neutral-300' : 'text-neutral-400'}`} />
              <p className={`mb-2 ${uploading ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {uploading ? 'Uploading files...' : 'Click to upload files or drag and drop'}
              </p>
              <p className="text-sm text-neutral-500">
                Images, PDFs, and documents up to 10MB
              </p>
              
              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress).map(([filename, progress]) => (
                    <div key={filename} className="text-left">
                      <div className="flex justify-between text-sm text-neutral-600 mb-1">
                        <span className="truncate">{filename}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-secondary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({mediaItems.length})
            </Button>
            <Button
              variant={filter === 'images' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('images')}
            >
              Images ({mediaItems.filter(item => item.type === 'image').length})
            </Button>
            <Button
              variant={filter === 'documents' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('documents')}
            >
              Documents ({mediaItems.filter(item => item.type === 'document').length})
            </Button>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="col-span-full">
                <LoadingSpinner subtle={true} className="py-8" />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedItems.includes(item.id)
                      ? 'border-secondary-500 ring-2 ring-secondary-200'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => handleSelectItem(item.id)}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        // Fallback to file icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-neutral-100 flex items-center justify-center">
                      <File className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                  
                  {/* Fallback for failed images */}
                  <div className="w-full h-32 bg-neutral-100 items-center justify-center hidden">
                    <File className="w-8 h-8 text-neutral-400" />
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm font-medium text-neutral-700 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item.url);
                      }}
                      className="p-1 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-all"
                      title="Copy URL"
                    >
                      {copiedUrl === item.url ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-neutral-600" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>

                  {/* Selection indicator */}
                  {selectedItems.includes(item.id) && (
                    <div className="absolute top-2 left-2">
                      <div className="w-5 h-5 bg-secondary-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-neutral-500">
                <Image className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p>No media files found</p>
                <p className="text-sm mt-1">Upload some files to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {onSelectMedia && (
          <div className="border-t border-neutral-200 p-6 flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSelectAndClose}
              disabled={selectedItems.length === 0}
            >
              Select {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;