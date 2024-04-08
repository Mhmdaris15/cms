import { Card, CardHeader, CardBody, Typography, Button, Spinner } from '@material-tailwind/react';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';
import '../assets/css/imagecrop.css';
import { toast } from 'react-toastify';

export function CardDefault({ getContent, isLoading, contentDatas, setContentDatas }: any) {
    const [validationMessage, setValidationMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadings, setLoadings] = useState<string[]>([]);
    const [loadingsDelete, setLoadingsDelete] = useState<string[]>([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [menuData, setMenuData] = useState<{ id: string; year: string }[]>([]); // Initialize with an empty array

    const [editedContent, setEditedContent] = useState({
        id: '',
        title: '',
        image: '',
        content: '',
    });
    const [imageData, setImageData] = useState<string | ArrayBuffer | null>(null);
    const [currentDataId, setCurrentDataId] = useState('' as string);
    const [selectedDataId, setSelectedDataId] = useState('');
    const [selectedDataYear, setSelectedDataYear] = useState('');

    const [isDropdownOpen, setIsDropdownOpen] = useState<{ [key: number]: boolean }>({});
    const [dropDownColor, setdropDownColor] = useState<{ [key: number]: string }>({
        0: 'white',
        1: 'white',
        // Add more entries for each dropdown
    });

    const getContentDetails = async (contentId: string) => {
        try {
            const response = await fetch(`https://api.angkieyudistia.com/v1/api/content/get-content?skip=0&limit=100&menu_id=null&content_id=${contentId}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching content details:', error);
            throw error;
        }
    };

    const handleEdit = async (id: string) => {
        try {
            setLoadings((prevLoadings) => [...prevLoadings, id]);
            setLoading(true);
            const contentDetails = await getContentDetails(id);
            setEditedContent({
                id: id,
                title: contentDetails?.data.title || '',
                image: contentDetails?.data.image || '',
                content: contentDetails?.data.content || '',
            });
            setCurrentDataId(id);
            setImageData(contentDetails?.data.image || '');
            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching content details for editing', error);
            setLoading(false);
        } finally {
            setLoading(false);
            setLoadings([]);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoadingsDelete((prevLoadings) => [...prevLoadings, id]);

            const response = await fetch(`https://api.angkieyudistia.com/v1/api/content/delete-content/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const data = await response.json();
            console.log('data', data);
            if (data.code === 200) {
                setContentDatas((prevContentData: any) => prevContentData.filter((content: any) => content.id !== id));
                setDeleteConfirmation(true);
                setTimeout(() => {
                    setDeleteConfirmation(false);
                }, 3000);
                toast.success('Data has been deleted successfully.', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
            setLoadingsDelete((prevLoadings) => prevLoadings.filter((loadingId) => loadingId !== id)); // Remove the ID from the loadingsDelete state after delete operation completes
            return data;
        } catch (error) {
            console.error('Error deleting content', error);
            setLoading(false);
        }
    };

    const closedSvg = (
        <svg className="w-8 h-8" aria-hidden="true" xmlns="" fill="white" viewBox="0 0 16 10">
            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
        </svg>
    );
    const getMenu = async () => {
        try {
            const response = await fetch('https://api.angkieyudistia.com/v1/api/menu/get-menu', {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const data = await response.json();
            setMenuData(data.data);
            if (data.data.length > 0) {
                const initialMenuId = data.data[0].id;
                const contentDataResponse = await getContent(initialMenuId);
                if (contentDatas) {
                    if (Array.isArray(contentDataResponse?.data?.data)) {
                        setContentDatas(contentDataResponse.data.data);
                    } else {
                        console.error('Invalid content data:', contentDataResponse);
                    }
                }
            }
            return data;
        } catch (error) {
            console.error('Error getting menu data', error);
        }
    };

    React.useEffect(() => {
        getMenu();
    }, []);

    const handleMenuChange = async (selectedMenuId: string) => {
        try {
            setSelectedDataId(selectedMenuId);
            if (selectedMenuId === 'all') {
                const response = await fetch('https://api.angkieyudistia.com/v1/api/content/get-content?skip=0&limit=100&menu_id=null', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                });
                const data = await response.json();
                setContentDatas(data.data.content || contentDatas);
            } else {
                const contentDataResponse = await getContent(selectedMenuId);
                if (Array.isArray(contentDataResponse?.data?.data)) {
                    setContentDatas(contentDataResponse.data.data);
                } else {
                    console.error('Invalid content data:', contentDataResponse);
                }
            }
        } catch (error) {
            console.error('Error getting content data:', error);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };
    const handleMenuYear = async (selectedYear: string) => {
        try {
            setSelectedDataYear(selectedYear);
            const selectedMenuId = selectedDataId === 'all' ? null : selectedDataId;
            const contentDataResponse = await getContent(selectedMenuId);
            if (Array.isArray(contentDataResponse?.data?.data)) {
                if (selectedYear === 'all') {
                    setContentDatas(contentDataResponse.data.data);
                } else {
                    const filteredDataByYear = contentDataResponse.data.data.filter((content: any) => content.year === selectedYear);
                    setContentDatas(filteredDataByYear);
                }
            } else {
                console.error('Invalid content data:', contentDataResponse);
            }
        } catch (error) {
            console.error('Error getting content data:', error);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true); // Set loading state to true before making the API call

            const contentToSave = editedContent.content.trim() === '' ? editedContent.content : editedContent.content;
            console.log('content', editedContent.content);
            const response = await fetch(`https://api.angkieyudistia.com/v1/api/content/update-content/${editedContent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    title: editedContent.title,
                    image: imageData,
                    content: contentToSave,
                }),
            });
            const data = await response.json();
            setIsEditModalOpen(false);
            if (data.code === 200) {
                setContentDatas((prevContentData: any) => {
                    return prevContentData.map((content: any) => {
                        if (content.id === editedContent.id) {
                            return {
                                ...content,
                                title: editedContent.title,
                                image: imageData,
                                content: contentToSave,
                            };
                        }
                        return content;
                    });
                });
                toast.success('Changes saved successfully', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error saving changes', error);
            setValidationMessage('Error saving changes. Please try again.');
            setShowValidation(true);
        } finally {
            setLoading(false); // Set loading state back to false after the API call completes
        }
    };
    if (selectedDataId === undefined) {
        return null;
    }
    if (selectedDataYear === undefined) {
        return null;
    }

    let filteredData = !selectedDataId ? contentDatas : selectedDataId === 'all' ? contentDatas : contentDatas.filter((content: any) => content.menuId === selectedDataId);

    let filteredDataArray = Array.isArray(filteredData) ? filteredData : [];

    const uniqueYears = Array.from(new Set(filteredDataArray.map((year: any) => year.year)));

    React.useEffect(() => {
        filteredData = !selectedDataId ? contentDatas : selectedDataId === 'all' ? contentDatas : contentDatas.filter((content: any) => content.menuId === selectedDataId);
    }, [contentDatas]);

    const toggleDropdown = (index: number) => {
        const dropdownId = `dropdown-${index}`;
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
        setIsDropdownOpen((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));

        setdropDownColor((prevState) => ({
            ...prevState,
            [index]: prevState[index] === 'white' ? 'red' : 'white',
        }));
    };

    const handleClickOutside = (event: any) => {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        });
    };

    return (
        <div onClick={(e) => handleClickOutside(e)} className="">
            {deleteConfirmation && <div className="bg-green-500 text-white p-4 rounded-md">Data has been deleted successfully.</div>}
            <Formik initialValues={{ title: '', image: '', content: '', menuId: '' }} onSubmit={() => {}}>
                <Form>
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            <div>
                                <label htmlFor="menuId">Select Menu:</label>
                                <Field as="select" name="menu_id" onChange={(e: any) => handleMenuChange(e.target.value)}>
                                    <option defaultChecked value="all">
                                        All
                                    </option>
                                    {(menuData as any).map((menu: any, i: any) => (
                                        <option key={i} value={menu.id}>
                                            {menu.menu_name}
                                        </option>
                                    ))}
                                </Field>
                            </div>

                            <div className="ml-4 justify-end">
                                <label htmlFor="year">Select Years:</label>
                                <Field as="select" name="year" onChange={(e: any) => handleMenuYear(e.target.value)}>
                                    <option value="all">All Years</option>
                                    {uniqueYears.map((year: any, i: number) => (
                                        <option key={i} value={year} selected={year === selectedDataYear}>
                                            {year}
                                        </option>
                                    ))}
                                </Field>
                            </div>
                        </div>

                        <div className="flex flex-row w-full items-start justify-start flex-wrap gap-5 mt-10">
                            {filteredDataArray.map((content: any, i) => {
                                const displayedTitle = content?.title?.length > 10 ? content?.title?.substring(0, 20) + '...' : content?.title;
                                const displayedContent = content?.content?.length > 40 ? content?.content?.substring(0, 90) + '...' : content?.content;
                                return (
                                    <div className="flex justify-start w-fit overflow-hidden" key={i}>
                                        <div className="relative rounded-t-lg">
                                            <div className="flex justify-end absolute top-0 right-0 px-4 pt-4 border-red-900">
                                                <div id={`dropdown-${i}`} className="z-10 hidden text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                                    <ul className="py-2" aria-labelledby={`dropdownButton-${i}`}>
                                                        <li>
                                                            <a
                                                                onClick={() => handleEdit(content?.id)}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                                            >
                                                                {loadings.includes(content?.id) ? <Spinner /> : 'Edit'}
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                onClick={() => handleDelete(content?.id)}
                                                                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                                            >
                                                                {loadingsDelete.includes(content?.id) ? <Spinner /> : 'Delete'}
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div key={content?.id} className="w-[300px] h-[370px] bg-white border  rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                                <a className="relative overflow-hidden">
                                                    <button
                                                        id={`dropdownButton-${i}`} // Unique ID for dropdown button
                                                        onClick={() => toggleDropdown(i)} // Pass only the index to toggleDropdown
                                                        className="absolute top-5 right-5 z-50 inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-500 rounded-full"
                                                        type="button"
                                                    >
                                                        <div className="rotate-90">
                                                            <span className="sr-only">Open dropdown</span>
                                                            {isDropdownOpen[i] ? <p className="text-red-900 font-bold w-10 rotate-90">X</p> : closedSvg}
                                                        </div>
                                                    </button>
                                                    <img className="w-full h-[200px] rounded-t-lg" src={content?.image} alt="" />
                                                    <div className="absolute rounded-t-lg inset-0 bg-black w-full h-full opacity-50"></div>
                                                </a>
                                                <div className="p-5">
                                                    <a href="#">
                                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                            <p dangerouslySetInnerHTML={{ __html: displayedTitle }}></p>
                                                        </h5>
                                                    </a>
                                                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                                        <p dangerouslySetInnerHTML={{ __html: displayedContent }}></p>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Form>
            </Formik>
            <Modal
                setLoading={setLoading}
                loading={loading}
                content={filteredData}
                setEditedContent={setEditedContent}
                handleCloseEditModal={handleCloseEditModal}
                handleSaveChanges={handleSaveChanges}
                setImageData={setImageData}
                editedContent={editedContent}
                isEditModalOpen={isEditModalOpen}
                imageData={imageData}
                validationMessage={validationMessage}
                showValidation={showValidation}
                setValidationMessage={setValidationMessage}
                setShowValidation={setShowValidation}
                setImageDataFromCrop={setImageData}
            />
        </div>
    );
}
