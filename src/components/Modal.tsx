import { Spinner } from '@material-tailwind/react';
import '../assets/css/imagecrop.css';
import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const Modal = ({ setLoading, loading, setEditedContent, handleCloseEditModal, handleSaveChanges, setImageData, editedContent, isEditModalOpen, imageData, setImageDataFromCrop }: any) => {
    const [validationMessage, setValidationMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [reactQuill, setReactQuill] = useState<string>(''); // Content state
    const [cropData, setCropData] = useState<string | null>(null);
    const cropperRef = useRef<ReactCropperElement>(null);
    React.useEffect(() => {
        setReactQuill(editedContent?.content);
        if (isEditModalOpen) {
            window.scrollTo(0, 0);
        }
    }, [isEditModalOpen]);

    const handleSaveAndValidate = async () => {
        try {
            setLoading(true);

            // Save changes with cropped image data
            await handleSaveChanges(cropData);

            setShowValidation(true);
        } catch (error) {
            console.error('Error saving changes', error);
            setValidationMessage('Error saving changes. Please try again.');
            setShowValidation(true);
        } finally {
            setLoading(false);
        }
    };

    const getCropData = () => {
        if (typeof cropperRef.current?.cropper !== 'undefined') {
            setCropData('#'); // Reset cropData to an empty string
            setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL()); // Update cropData with new cropped image data
            setImageDataFromCrop(cropperRef.current?.cropper.getCroppedCanvas().toDataURL()); // Update imageData with cropped image data
        }
    };

    return (
        <>
            {isEditModalOpen && (
                <div className="modal-container max-w-5xl mx-auto">
                    <div className="absolute h-screen w-screen bg-opacity-50 bg-gray-900"></div>
                    <div className="modal-content mt-10">
                        <h2 className="text-2xl font-semibold mb-4">Edit Content</h2>
                        <form>
                            {/* Title field */}
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-600 text-sm font-medium mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="edit the new title..."
                                    value={editedContent?.title}
                                    onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="image" className="block text-gray-600 text-sm font-medium mb-2">
                                    Edit Image
                                </label>
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
                                <br />
                                <br />
                                <div className="w-full">
                                    <Cropper
                                        style={{ height: 400, width: '100%' }}
                                        initialAspectRatio={1}
                                        preview=".img-preview"
                                        src={imageData}
                                        ref={cropperRef}
                                        viewMode={1}
                                        guides={true}
                                        minCropBoxHeight={10}
                                        minCropBoxWidth={10}
                                        background={false}
                                        responsive={true}
                                        checkOrientation={false}
                                        onCrop={getCropData}
                                        {...({ onCrop: getCropData } as any)}
                                    />
                                </div>
                                <div>
                                    <br />
                                    <br />
                                    <div className="w-fit h-fit">
                                        <h1>
                                            <button
                                                style={{ float: 'left' }}
                                                onClick={getCropData}
                                                className="w-[300px] rounded-lg bg-blue-500 text-white py-3"
                                                type="button" // Add this line to specify the button type
                                            >
                                                Click here to crop the image
                                            </button>
                                        </h1>
                                        <br />
                                        <br />
                                        <br />
                                        <br />

                                        {cropData && <img className="w-fit h-fit" src={cropData} alt="cropped" />}
                                    </div>
                                </div>
                                <br style={{ clear: 'both' }} />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="content" className="block text-gray-600 text-sm font-medium mb-2">
                                    Content
                                </label>
                                <ReactQuill
                                    id="content"
                                    theme="snow"
                                    value={reactQuill}
                                    onChange={(e) => {
                                        setReactQuill(e);
                                        setEditedContent({ ...editedContent, content: e });
                                    }}
                                />
                            </div>
                            {showValidation && <p className="text-red-500 mb-4">{validationMessage}</p>}
                            <div className="flex justify-end">
                                <button type="button" onClick={handleCloseEditModal} className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAndValidate}
                                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {loading ? <Spinner /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
