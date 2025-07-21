import { supabase } from '../lib/supabase';

const STORAGE_BUCKET = 'cms-media';

/**
 * Test storage bucket existence and permissions
 */
export async function testStorageBucket() {
  console.log('🧪 Testing storage bucket:', STORAGE_BUCKET);
  
  try {
    // Step 1: Check if bucket exists
    console.log('Step 1: Checking if bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return {
        success: false,
        error: `Failed to list buckets: ${bucketsError.message}`,
        step: 'list_buckets'
      };
    }
    
    console.log('Available buckets:', buckets);
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      console.error('❌ Bucket does not exist:', STORAGE_BUCKET);
      return {
        success: false,
        error: `Storage bucket '${STORAGE_BUCKET}' does not exist`,
        step: 'check_bucket_exists'
      };
    }
    
    console.log('✅ Bucket exists:', STORAGE_BUCKET);
    
    // Step 2: Test listing files
    console.log('Step 2: Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      
    if (listError) {
      console.error('❌ Error listing files:', listError);
      return {
        success: false,
        error: `Failed to list files: ${listError.message}`,
        step: 'list_files'
      };
    }
    
    console.log('✅ File listing successful, found', files?.length || 0, 'files');
    
    // Step 3: Test file upload
    console.log('Step 3: Testing file upload...');
    const testFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`test-${Date.now()}.txt`, testFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError);
      return {
        success: false,
        error: `Failed to upload test file: ${uploadError.message}`,
        step: 'upload_file'
      };
    }
    
    console.log('✅ File upload successful:', uploadData);
    
    // Step 4: Test file URL generation
    console.log('Step 4: Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(uploadData?.path || '');
      
    console.log('✅ Public URL generated:', urlData);
    
    return {
      success: true,
      message: 'All storage tests passed successfully',
      buckets,
      files,
      uploadResult: uploadData,
      publicUrl: urlData
    };
    
  } catch (error) {
    console.error('❌ Unexpected error during storage test:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'unexpected_error'
    };
  }
}

/**
 * Call the debug-storage edge function
 */
export async function callStorageDebugFunction() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not defined');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/debug-storage`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling debug-storage function:', error);
    throw error;
  }
}