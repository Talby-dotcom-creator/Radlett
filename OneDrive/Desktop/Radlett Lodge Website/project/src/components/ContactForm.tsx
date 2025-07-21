import React, { useState } from 'react';
import Button from './Button';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    interested: false
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');
    
    try {
      // Get the Supabase URL from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured. Please set up your environment variables.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      setFormStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          interested: false
        });
        setFormStatus('idle');
      }, 5000);

    } catch (error) {
      console.error('Error sending email:', error);
      setFormStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-primary-600">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={formStatus === 'submitting'}
            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-primary-600">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={formStatus === 'submitting'}
            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block mb-2 text-sm font-medium text-primary-600">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={formStatus === 'submitting'}
            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block mb-2 text-sm font-medium text-primary-600">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={formStatus === 'submitting'}
            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Please select</option>
            <option value="general">General Inquiry</option>
            <option value="membership">Membership Information</option>
            <option value="events">Events Information</option>
            <option value="visiting">Visiting the Lodge</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className="block mb-2 text-sm font-medium text-primary-600">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          required
          disabled={formStatus === 'submitting'}
          className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        />
      </div>
      
      <div className="flex items-start">
        <input
          type="checkbox"
          id="interested"
          name="interested"
          checked={formData.interested}
          onChange={handleCheckboxChange}
          disabled={formStatus === 'submitting'}
          className="mt-1 mr-2 disabled:cursor-not-allowed"
        />
        <label htmlFor="interested" className="text-sm text-primary-600">
          I am interested in becoming a Freemason and would like to receive more information
        </label>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          type="submit" 
          disabled={formStatus === 'submitting'}
          className="min-w-[150px]"
        >
          {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
        </Button>
        
        {formStatus === 'success' && (
          <div className="text-green-600 font-medium animate-fadeIn">
            ✓ Your message has been sent successfully! We'll get back to you soon.
          </div>
        )}
        
        {formStatus === 'error' && (
          <div className="text-red-600 font-medium animate-fadeIn">
            ✗ {errorMessage}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-md">
        <p><strong>Note:</strong> Your message will be sent directly to our Lodge Secretary. We typically respond within 24-48 hours during weekdays.</p>
      </div>
    </form>
  );
};

export default ContactForm;