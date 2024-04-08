import React, { useEffect } from 'react';

const ModalImage = ({ content, setEditedContent, handleCloseEditModal, handleSaveChanges, setImageData, editedContent, isEditModalOpen }: any) => {
    return (
        <div>
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[9999] grid place-items-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Edit Content</h2>
                        <form>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-600 text-sm font-medium mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Enter the new title..."
                                    value={editedContent?.title}
                                    onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="image" className="block text-gray-600 text-sm font-medium mb-2">
                                    Edit Image
                                </label>
                                <img src={content[0]?.image} alt={content[0]?.title} className="w-full mb-4" />
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    className="w-full border rounded-md p-2"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImageData(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="content" className="block text-gray-600 text-sm font-medium mb-2">
                                    Content
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    placeholder="Enter the new content..."
                                    value={editedContent?.content}
                                    onChange={(e) => setEditedContent({ ...editedContent, content: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={handleCloseEditModal} className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSaveChanges} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModalImage;
