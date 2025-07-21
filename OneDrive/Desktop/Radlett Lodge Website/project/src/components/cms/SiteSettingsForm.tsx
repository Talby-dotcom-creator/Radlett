import React from 'react';
import { useForm } from 'react-hook-form';
import { CMSSiteSetting } from '../../types';
import Button from '../Button';

interface SiteSettingsFormProps {
  initialData: CMSSiteSetting[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}

const SiteSettingsForm: React.FC<SiteSettingsFormProps> = ({ initialData, onSubmit, onCancel }) => {
  // Create default values object from initial data
  const defaultValues = initialData.reduce((acc, setting) => {
    acc[setting.setting_key] = setting.setting_value;
    return acc;
  }, {} as Record<string, string>);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues
  });

  const onFormSubmit = async (data: Record<string, string>) => {
    await onSubmit(data);
  };

  // Group settings by category for better organization
  const groupedSettings = initialData.reduce((acc, setting) => {
    const category = setting.setting_key.includes('contact') ? 'Contact Information' :
                    setting.setting_key.includes('meeting') ? 'Meeting Information' :
                    setting.setting_key.includes('_url') ? 'Social Media' :
                    'General';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, CMSSiteSetting[]>);

  const getInputType = (settingType: string) => {
    switch (settingType) {
      case 'number':
        return 'number';
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      default:
        return 'text';
    }
  };

  const renderSettingInput = (setting: CMSSiteSetting) => {
    const inputType = getInputType(setting.setting_type || 'text');
    const isTextarea = setting.setting_key.includes('schedule') || setting.setting_key.includes('location');

    if (isTextarea) {
      return (
        <textarea
          id={setting.setting_key}
          {...register(setting.setting_key, { required: 'This field is required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
        />
      );
    }

    return (
      <input
        id={setting.setting_key}
        type={inputType}
        {...register(setting.setting_key, { required: 'This field is required' })}
        className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-secondary-500 focus:ring-secondary-500"
      />
    );
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Url/g, 'URL');
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {Object.entries(groupedSettings).map(([category, settings]) => (
        <div key={category} className="space-y-6">
          <h3 className="text-lg font-semibold text-primary-600 border-b border-neutral-200 pb-2">
            {category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.map((setting) => (
              <div key={setting.setting_key} className="space-y-2">
                <label htmlFor={setting.setting_key} className="block text-sm font-medium text-primary-600">
                  {formatLabel(setting.setting_key)}
                </label>
                
                {renderSettingInput(setting)}
                
                {setting.description && (
                  <p className="text-xs text-neutral-500">{setting.description}</p>
                )}
                
                {errors[setting.setting_key] && (
                  <p className="text-sm text-red-600">
                    {errors[setting.setting_key]?.message as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
};

export default SiteSettingsForm;