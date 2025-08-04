import React, { useState } from 'react';

const SaveJobForm = ({ job, onSave, onCancel, existingSave, isVisible }) => {
    const [note, setNote] = useState(existingSave?.note || '');
    const [priority, setPriority] = useState(existingSave?.priority || 'medium');
    const [tags, setTags] = useState(existingSave?.tags || []);
    const [newTag, setNewTag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isVisible) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await onSave({
                jobId: job._id,
                note: note.trim(),
                priority,
                tags: tags.filter(tag => tag.trim() !== '')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Comment-style header */}
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-3">
                            <span className="text-sm font-medium text-gray-900">Add a note</span>
                            
                            {/* Priority Selection - Inline */}
                            <div className="flex space-x-1">
                                {[
                                    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                                    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                                    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 hover:bg-red-200' }
                                ].map(({ value, label, color }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPriority(value)}
                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                            priority === value 
                                                ? color + ' ring-1 ring-offset-1 ' + (value === 'high' ? 'ring-red-300' : value === 'medium' ? 'ring-yellow-300' : 'ring-gray-300')
                                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Note Textarea */}
                        <div className="bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="This company is great..."
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 text-sm border-0 rounded-lg resize-none focus:outline-none"
                            />
                            <div className="px-3 pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {note.length}/500
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div className="mt-3">
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Add Tag Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add tag..."
                                    className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                                    maxLength="50"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    disabled={!newTag.trim()}
                                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Saving...' : existingSave ? 'Update' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={isSubmitting}
                                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                <span>Save for later</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SaveJobForm;