'use client';

import React, { useState, useEffect } from 'react';
import { usePictures } from '@/hooks/useDatabase';
import { BackToSettingsLink } from '@/components/BackToSettingsLink';
import { FormHeader } from '@/components/shared/FormHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StatsCard } from '@/components/shared/StatsCard';
import { ImageUpload } from '@/components/pictures/ImageUpload';
import { FaviconSelector } from '@/components/pictures/FaviconSelector';
import { WordArt } from '@/components/pictures/WordArt';
import { Picture, CreatePicture, UpdatePicture } from '@/types';

// Icons
const PhotoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

type ViewMode = 'list' | 'create' | 'edit' | 'view';
type PictureSource = 'upload' | 'favicon' | 'wordart';

interface PictureFormData {
  name: string;
  altText: string;
  base64ImageData: string;
}

export default function PicturesManagementPage() {
  const {
    pictures,
    isLoading,
    error,
    createPicture,
    updatePicture,
    deletePicture,
    refresh,
  } = usePictures();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPicture, setSelectedPicture] = useState<Picture | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<PictureFormData>({
    name: '',
    altText: '',
    base64ImageData: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pictureSource, setPictureSource] = useState<PictureSource>('upload');

  // Filter pictures based on search term
  const filteredPictures = pictures.filter(
    (picture) =>
      picture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      picture.altText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === 'create') {
      setFormData({ name: '', altText: '', base64ImageData: '' });
      setSelectedPicture(null);
      setPictureSource('upload');
    } else if (viewMode === 'edit' && selectedPicture) {
      setFormData({
        name: selectedPicture.name,
        altText: selectedPicture.altText,
        base64ImageData: selectedPicture.base64ImageData,
      });
      setPictureSource('upload');
    }
    setFormErrors({});
  }, [viewMode, selectedPicture]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Picture name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Picture name must be at least 2 characters';
    } else {
      // Check for duplicate names (excluding current picture when editing)
      const existingPicture = pictures.find(
        (picture) =>
          picture.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === 'create' || picture.id !== selectedPicture?.id)
      );
      if (existingPicture) {
        errors.name = 'A picture with this name already exists';
      }
    }

    if (!formData.altText.trim()) {
      errors.altText = 'Alt text is required for accessibility';
    }

    if (!formData.base64ImageData) {
      errors.base64ImageData = 'Please select or create an image';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const pictureData = {
        name: formData.name.trim(),
        altText: formData.altText.trim(),
        base64ImageData: formData.base64ImageData,
      };

      if (viewMode === 'create') {
        await createPicture(pictureData as CreatePicture);
      } else if (viewMode === 'edit' && selectedPicture) {
        await updatePicture({
          id: selectedPicture.id,
          ...pictureData,
        } as UpdatePicture);
      }

      setViewMode('list');
    } catch (err) {
      console.error('Failed to save picture:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (picture: Picture) => {
    if (picture.readonly) return;

    if (
      confirm(`Are you sure you want to delete the picture "${picture.name}"?`)
    ) {
      try {
        await deletePicture(picture.id);
      } catch (err) {
        console.error('Failed to delete picture:', err);
      }
    }
  };

  const handleImageSelected = (base64: string, fileName?: string) => {
    setFormData((prev) => ({
      ...prev,
      base64ImageData: base64,
      // If name is empty and we have a filename, use it (without extension)
      name: prev.name || (fileName ? fileName.replace(/\.[^/.]+$/, '') : ''),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading pictures...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error loading pictures: {error}</div>
            <button
              onClick={refresh}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackToSettingsLink />

        <div className="bg-white rounded-lg shadow-sm border">
          <FormHeader
            title="Pictures Management"
            subtitle="Manage images and icons for your URLs and bookmarks"
            icon={PhotoIcon}
            actionButton={
              viewMode === 'list' && (
                <button
                  onClick={() => setViewMode('create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Picture
                </button>
              )
            }
            onBack={viewMode !== 'list' ? () => setViewMode('list') : undefined}
          />

          {/* Content */}
          <div className="p-6">
            {viewMode === 'list' && (
              <div className="space-y-6">
                {/* Search */}
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search pictures..."
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Pictures"
                    value={pictures.length}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-blue-200"
                  />
                  <StatsCard
                    title="Editable Pictures"
                    value={pictures.filter((p) => !p.readonly).length}
                    bgColor="bg-green-50"
                    textColor="text-green-600"
                    borderColor="border-green-200"
                  />
                  <StatsCard
                    title="Readonly Pictures"
                    value={pictures.filter((p) => p.readonly).length}
                    bgColor="bg-gray-50"
                    textColor="text-gray-600"
                    borderColor="border-gray-200"
                  />
                </div>

                {/* Pictures Grid */}
                <div className="space-y-3">
                  {filteredPictures.length === 0 ? (
                    <div className="text-center py-12">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500">
                        {searchTerm
                          ? 'No pictures found matching your search.'
                          : 'No pictures yet.'}
                      </div>
                      {!searchTerm && (
                        <button
                          onClick={() => setViewMode('create')}
                          className="mt-4 text-blue-600 hover:text-blue-800 underline"
                        >
                          Add your first picture
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPictures.map((picture) => (
                        <div
                          key={picture.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={picture.base64ImageData}
                              alt={picture.altText}
                              className="w-16 h-16 rounded border object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 truncate">
                                    {picture.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 truncate mt-1">
                                    {picture.altText}
                                  </p>
                                  {picture.readonly && (
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-2">
                                      Readonly
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    setSelectedPicture(picture);
                                    setViewMode('view');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="View"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                {!picture.readonly && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedPicture(picture);
                                        setViewMode('edit');
                                      }}
                                      className="text-gray-600 hover:text-gray-800 p-1"
                                      title="Edit"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(picture)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Delete"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
              <div className="max-w-4xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {viewMode === 'create' ? 'Add New Picture' : 'Edit Picture'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Picture Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Google Favicon"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="altText"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Alt Text *
                      </label>
                      <input
                        type="text"
                        id="altText"
                        value={formData.altText}
                        onChange={(e) =>
                          setFormData({ ...formData, altText: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.altText
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="e.g., Google search engine logo"
                      />
                      {formErrors.altText && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.altText}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Picture Source Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Picture Source *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {[
                        {
                          value: 'upload' as PictureSource,
                          label: 'Upload File',
                        },
                        {
                          value: 'favicon' as PictureSource,
                          label: 'Website Favicon',
                        },
                        {
                          value: 'wordart' as PictureSource,
                          label: 'Text/WordArt',
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            pictureSource === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pictureSource"
                            value={option.value}
                            checked={pictureSource === option.value}
                            onChange={(e) =>
                              setPictureSource(e.target.value as PictureSource)
                            }
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="font-medium text-sm">
                              {option.label}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {formErrors.base64ImageData && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.base64ImageData}
                      </p>
                    )}
                  </div>

                  {/* Picture Input Component */}
                  <div>
                    {pictureSource === 'upload' && (
                      <ImageUpload
                        onImageSelected={handleImageSelected}
                        currentImage={formData.base64ImageData}
                      />
                    )}
                    {pictureSource === 'favicon' && (
                      <FaviconSelector
                        onFaviconSelected={(base64, size) => {
                          handleImageSelected(base64);
                          // Auto-fill alt text if empty
                          if (!formData.altText) {
                            setFormData((prev) => ({
                              ...prev,
                              altText: `Website favicon (${size}x${size})`,
                            }));
                          }
                        }}
                      />
                    )}
                    {pictureSource === 'wordart' && (
                      <WordArt
                        onImageGenerated={(base64) => {
                          handleImageSelected(base64);
                          // Auto-fill alt text if empty
                          if (!formData.altText) {
                            setFormData((prev) => ({
                              ...prev,
                              altText: `Generated text image: ${
                                formData.name || 'WordArt'
                              }`,
                            }));
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : viewMode === 'create'
                        ? 'Add Picture'
                        : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {viewMode === 'view' && selectedPicture && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  View Picture
                </h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
                  {/* Picture Display */}
                  <div className="text-center">
                    <img
                      src={selectedPicture.base64ImageData}
                      alt={selectedPicture.altText}
                      className="max-w-64 max-h-64 mx-auto rounded border shadow-sm"
                    />
                  </div>

                  {/* Picture Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Picture Name
                      </label>
                      <div className="text-gray-900">
                        {selectedPicture.name}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alt Text
                      </label>
                      <div className="text-gray-900">
                        {selectedPicture.altText}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID
                      </label>
                      <div className="text-gray-600 font-mono text-sm">
                        {selectedPicture.id}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="text-gray-900">
                        {selectedPicture.readonly ? 'Readonly' : 'Editable'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {!selectedPicture.readonly && (
                    <button
                      onClick={() => setViewMode('edit')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Picture
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
