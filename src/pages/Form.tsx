import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'; // Import Yup for validation
import ImageUploading, { ImageListType } from 'react-images-uploading';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../assets/css/file-upload-preview.css';
import '../assets/css/imagecrop.css';
import 'cropperjs/dist/cropper.css';
import { CardDefault } from './CardGet';
import { Alert, Spinner } from '@material-tailwind/react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { v4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FormProps = {
    id: string | any;
    menu_id: string | any;
    title: string;
    image: string;
    content: string;
    year: string | any;
};
interface YearData {
    id: string;
    year: string;
}
const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'), // Title field is required
    menu_id: Yup.string().required('Menu is required'), // Menu field is required
});

const FormIsi = () => {
    const [loading, setLoading] = useState(false);
    const [loadings, setLoadings] = useState(false);
    const [menuId, setMenuId] = useState([]);
    const [yearData, setYearData] = useState<YearData[]>([]);
    const [selectedDataId, setSelectedDataId] = useState('');

    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State for waiting loading spinner
    const [images2, setImages2] = useState<any>([]);
    const [contentData, setContentData] = useState<FormProps[]>([]);
    const maxNumber = 69;
    const [cropData, setCropData] = useState<string | null>(null);
    const cropperRef = useRef<ReactCropperElement>(null);
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages2(imageList as never[]);
        getCropData(); // Call getCropData when a new image is selected
    };
    const [getLoading, setGetLoading] = useState(false);

    const [postConfirmation, setPostConfirmation] = useState(false);
    const getCropData = () => {
        if (typeof cropperRef.current?.cropper !== 'undefined') {
            setCropData('#'); // Reset cropData to an empty string
            setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL()); // Update cropData with new cropped image data
        }
    };

    const getContent = async () => {
        try {
            setGetLoading(true);
            const response = await fetch(`https://api.angkieyudistia.com/v1/api/content/get-content?skip=0&limit=100&menu_id=null&content_id=null`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const data = await response.json();
            setContentData(data);
            return data;
        } catch (error) {
            console.error('Error getting content data', error);
        } finally {
            setGetLoading(false);
        }
    };

    const getMenu = async () => {
        try {
            const response = await fetch('https://api.angkieyudistia.com/v1/api/menu/get-menu', {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const data = await response.json();
            setMenuId(data);
            return data;
        } catch (error) {
            console.error('Error getting data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMenu();
        getContent();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getContent();
                if (response && response.data && response.data.year) {
                    setYearData(response.data.year);
                }
            } catch (error) {
                console.error('Error fetching year data:', error);
            }
        };

        fetchData();
    }, []);

    const postForm = async (form: FormProps, id: string) => {
        try {
            setLoadings(true);
            console.log(images2[0].file.size);

            if (images2.some((image: any) => image.file.size > 3072000)) {
                return toast.error('The image size must be less than 3 MB', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }

            const imageBase64Array = await Promise.all(
                images2.map(async (image: any) => {
                    const response = await fetch(image.dataURL);
                    const blob = await response.blob();
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                    return base64;
                })
            );

            form.image = imageBase64Array.toString();
            form.content = value;

            const formValue = {
                title: form.title,
                image: cropData,
                content: form.content,
                menu_id: form.menu_id,
                year: form.year,
            };

            const res = await fetch('https://api.angkieyudistia.com/v1/api/content/add-content', {
                method: 'POST',
                body: JSON.stringify(formValue),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            const response = await res.json();
            if (response.code === 200) {
                setContentData([
                    ...(contentData ?? []),
                    {
                        id: v4(),
                        title: formValue.title,
                        image: formValue.image ?? '',
                        content: formValue.content,
                        menu_id: formValue.menu_id,
                        year: formValue.year,
                    },
                ]);
                setLoadings(true);
                toast.success('Data Created Successfully', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                const response = await fetch(`https://api.angkieyudistia.com/v1/api/content/get-content?skip=0&limit=100&menu_id=null&content_id=null`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                });
                const data = await response.json();
                setContentData(data.data.data);
                setPostConfirmation(true);
                setTimeout(() => {
                    setPostConfirmation(false);
                }, 3000);
            } else {
                throw new Error('Failed to post data');
            }
            setCropData(null);
            return response;
        } catch (error) {
            console.error('Error posting data', error);
        } finally {
            setLoadings(false);
        }
    };
    let filteredData = !selectedDataId ? contentData : selectedDataId === 'all' ? contentData : contentData.filter((content: any) => content.menuId === selectedDataId);

    let filteredDataArray = Array.isArray(filteredData) ? filteredData : [];

    const uniqueYears = Array.from(new Set(filteredDataArray.map((year: any) => year.year)));

    useEffect(() => {
        filteredData = !selectedDataId ? contentData : selectedDataId === 'all' ? contentData : contentData.filter((content: any) => content.menuId === selectedDataId);
    }, [contentData]);
    return (
        <div className="flex flex-col gap-y-10">
            {getLoading && (
                <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
                    <Spinner />
                </div>
            )}
            <Formik
                initialValues={{ id: '', title: '', image: '', content: '', menu_id: '', year: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values, action) => {
                    const res = await postForm(values, values.id);
                    if (res.code === 200) {
                        action.resetForm();
                        setImages2([]);
                        setValue('');
                        setCropData(''); // Reset cropData after form submission
                    }
                }}
            >
                {(props: any) => (
                    <Form>
                        {loadings && (
                            <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
                                <Spinner />
                            </div>
                        )}
                        {postConfirmation && ( // Render success message if postConfirmation is true
                            <div className="bg-green-200 text-green-700 p-4 mb-4 rounded">Data posted successfully!</div>
                        )}
                        <div className="flex flex-col gap-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h5 className="font-semibold text-lg dark:text-white-light">Title</h5>
                                </div>
                                <Field type="text" name="title" placeholder="Some Text..." className="form-input" required />
                            </div>
                            <div>
                                <div className="custom-file-container" data-upload-id="mySecondImage">
                                    <div className="label-container">
                                        <label>Upload </label>
                                        <button
                                            type="button"
                                            className="custom-file-container__image-clear"
                                            title="Clear Image"
                                            onClick={() => {
                                                setImages2([]);
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <label className="custom-file-container__custom-file"></label>
                                    <input type="file" className="custom-file-container__custom-file__custom-file-input" accept="image/*" />
                                    <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                    <ImageUploading multiple value={images2} onChange={onChange}>
                                        {({ imageList, onImageUpload }) => (
                                            <div className="upload__image-wrapper">
                                                <button type="button" className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload}>
                                                    Choose File...
                                                </button>
                                                &nbsp;
                                                <div className="grid gap-4 sm:grid-cols-3 grid-cols-1">
                                                    {imageList.map((image, index) => (
                                                        <div key={index} className="custom-file-container__image-preview relative">
                                                            <div className="">
                                                                <div>
                                                                    <div style={{ width: '100%' }}>
                                                                        <Cropper
                                                                            style={{ height: 400, width: '100%' }}
                                                                            initialAspectRatio={1}
                                                                            preview=".img-preview"
                                                                            src={image.dataURL}
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
                                                                    <br />
                                                                    <br />
                                                                    <div>
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
                                                                            {cropData && <img className="w-fit h-fit" src={cropData} alt="cropped" />}
                                                                        </div>
                                                                    </div>
                                                                    <br style={{ clear: 'both' }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </ImageUploading>
                                    {images2.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h5 className="font-semibold text-lg dark:text-white-light">Select Menu</h5>
                                </div>
                                <select name="menu_id" value={props.values.menu_id} onChange={(e) => props.setFieldValue('menu_id', e.target.value)}>
                                    <option value="">Select Menu</option>
                                    {(menuId as any)?.data?.map((menu: any, i: any) => (
                                        <option key={i} value={menu.id}>
                                            {menu.menu_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h5 className="font-semibold text-lg dark:text-white-light">Years</h5>
                                </div>
                                <Field type="year" name="year" placeholder="input years" className="form-input" required />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h5 className="font-semibold text-lg dark:text-white-light">Content</h5>
                                </div>
                                <div className="">
                                    <ReactQuill id="content" theme="snow" value={value} onChange={setValue} />
                                </div>
                                <button type="submit" className="btn btn-primary mt-6" disabled={loading || !props.isValid}>
                                    {loadings ? <Spinner /> : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>

            <CardDefault setContentDatas={setContentData} contentDatas={contentData} getContent={getContent} isLoading={isLoading} />
        </div>
    );
};

export default FormIsi;
