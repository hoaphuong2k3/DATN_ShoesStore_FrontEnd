import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findShoes } from "services/Product2Service";
import { getAllShoesDetail, getAllShoesDetail3 } from "services/ShoesDetailService.js";
import ReactPaginate from 'react-paginate';
import { FaEdit, FaTrash, FaLock, FaLockOpen, FaAngleDown, FaAngleUp, FaFilter, FaSearch, FaQrcode, FaSort } from 'react-icons/fa';
import { getAllColorId, getAllSizeId, getAllColor, getAllSize } from "services/ProductAttributeService";
import { getAllImage, updateImage, postNewImage, deleteImage } from "services/ImageService";
import {
    Card, CardBody, Container, Row, Col, FormGroup, Input, Button, Form, CardTitle, Label, Table, Badge, Modal, ModalHeader, ModalFooter, ModalBody, CardHeader, InputGroup, InputGroupAddon, InputGroupText
} from "reactstrap";
import { Tooltip, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import Switch from 'react-input-switch';
import axios from "axios";
import SlideShow from './SlideShow';
import QrReader from 'react-qr-reader';
import axiosInstance from "services/custommize-axios";

const ListShoesDetail = () => {

    const [modal3, setModal3] = useState(false);
    const toggle3 = () => setModal3(!modal3);
    const [result, setResult] = useState("");
    let handleScan = (data) => {
        if (data) {
            setResult(data);
            setModal3(false);
            fetchData();
        }
    };

    let handleError = err => {
        // toast.error("Không tìm thấy sản phẩm");
    };

    const fetchData = async () => {
        try {
            if (result) {
                setSearch({ qrCode: result });
                const res = await getAllShoesDetail(id, page, size, search);
                if (res && res.data && res.data.content) {
                    setListShoesDetail(res.data.content);
                    if (res.data.content.length > 0) {
                        openEdit(res.data.content[0].shoesDetailSearchResponse.id);
                    }
                    setResult("");
                }
            }
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchData();
    }, [result]);

    const [value, setValue] = useState('no');
    const { id } = useParams();
    const statusMapping = {
        0: { color: 'danger', label: 'Ngừng kinh doanh' },
        1: { color: 'success', label: 'Đang kinh doanh' },
        2: { color: 'warning', label: 'Hết hàng' }
    };

    let navigate = useNavigate();
    const [ListShoesDetail, setListShoesDetail] = useState([]);
    const [listSizeById, setListSizeById] = useState([]);
    const [listColorById, setListColorById] = useState([]);
    const [listSize, setListSize] = useState([]);
    const [listColor, setListColor] = useState([]);
    const [dataShoesById, setDataShoesById] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElenments] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const handlePageClick = (event) => {
        setPage(+event.selected);
    }
    const onChangeSize = (e) => {
        setSize(+e.target.value);
    }
    //getData
    const [search, setSearch] = useState({
        code: "",
        sizeId: null,
        colorId: null,
        fromQuantity: null,
        toQuantity: null,
        fromPrice: null,
        toPrice: null,
        status: null,
        fromDateStr: "",
        toDateStr: "",
        createdBy: "",
        fromDate: "",
        toDate: "",
        qrCode: "",
    });
    const resetSearch = () => {
        setSearch({
            code: "",
            sizeId: "",
            colorId: "",
            fromQuantity: "",
            toQuantity: "",
            fromPrice: "",
            toPrice: "",
            status: "",
            fromDateStr: "",
            toDateStr: "",
            createdBy: "",
            fromDate: "",
            toDate: ""
        })
    };
    const getData = async () => {
        try {
            let res = await findShoes(id);
            if (res && res.data) {
                setDataShoesById(res.data);
            }
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
            navigate("/admin/product");
        }
    }
    //getAll
    const getAll = async () => {
        try {
            let res = await getAllShoesDetail3(id, page, size, search, sort, sortStyle);
            console.log("res6:", res);
            if (res && res.data && res.data.content) {
                setListShoesDetail(res.data.content);
                setTotalElenments(res.data.totalElements);
                setTotalPages(res.data.totalPages);
            }
        } catch (error) {
            setListShoesDetail([]);
        }
    }

    const [listCheck, setListCheck] = useState([]);
    const getListCheck = async () => {
        try {
            let res = await getAllShoesDetail(id, page, size, search);
            if (res && res.data && res.data.content) {
                setListCheck(res.data.content);
            }
        } catch (error) {
            setListShoesDetail([]);
        }
    }
    useEffect(() => {
        console.log("search", ListShoesDetail);
    }, [ListShoesDetail]);
    useEffect(() => {
        getAll();
    }, [search]);

    useEffect(() => {
        console.log("size", size);
        getAll();
    }, [size]);
    useEffect(() => {
        console.log("page", page);
        getAll();
    }, [page]);
    useEffect(() => {
        getlistColorById();
        getlistSizeById();
        getlistColor();
        getlistSize();
        getData();
        getAll();
        getListCheck();
    }, []);


    const onInputChange = async (e) => {
        await setSearch({ ...search, [e.target.name]: e.target.value });
    };
    //Hiển thị combobox
    const getlistColorById = async () => {
        let res = await getAllColorId(id);
        if (res && res.data) {
            setListColorById(res.data);
        }
    }
    const getlistSizeById = async () => {
        let res = await getAllSizeId(id);
        if (res && res.data) {
            setListSizeById(res.data);
        }
    }
    //Bắt đầu conmbobox
    const getlistColor = async () => {
        let res = await getAllColor();
        if (res && res.data) {
            setListColor(res.data);
        }
    }
    const getlistSize = async () => {
        let res = await getAllSize();
        if (res && res.data) {
            setListSize(res.data);
        }
    }

    //Cbb selected
    const [selectAllSize, setSelectAllSize] = useState(false);
    const [checkboxesSize, setCheckboxesSize] = useState([]);
    const [selectedValuesSize, setSelectedValuesSize] = useState([]);
    const initializeCheckboxesSize = () => {
        const initialCheckboxesSize = listSize.map((item) => ({
            id: item.id,
            label: item.name,
            checked: false,
        }));
        setCheckboxesSize(initialCheckboxesSize);
    };

    function handleSelectAllSize() {
        const updatedCheckboxesSize = checkboxesSize.map((checkbox) => ({
            ...checkbox,
            checked: !selectAllSize,
        }));
        setCheckboxesSize(updatedCheckboxesSize);
        setSelectAllSize(!selectAllSize);
        // Cập nhật selectedValuesSize dựa trên checkboxes đã chọn
        const selectedValuesSize = updatedCheckboxesSize
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => ({ id: checkbox.id, name: checkbox.label }));
        setSelectedValuesSize(selectedValuesSize);
    }

    function handleCheckboxSizeChange(checkboxId) {
        const updatedCheckboxesSize = checkboxesSize.map((checkbox) =>
            checkbox.id === checkboxId ? { ...checkbox, checked: !checkbox.checked } : checkbox
        );
        setCheckboxesSize(updatedCheckboxesSize);

        // Cập nhật selectedValuesSize dựa trên checkboxes đã chọn
        const selectedValuesSize = updatedCheckboxesSize
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => ({ id: checkbox.id, name: checkbox.label }));
        setSelectedValuesSize(selectedValuesSize);
    }
    useEffect(() => {
        initializeCheckboxesSize();
    }, [listSize]);
    //End Cbb selected

    //Cbb selected color
    const [selectAllColor, setSelectAllColor] = useState(false);
    const [checkboxesColor, setCheckboxesColor] = useState([]);
    const [selectedValuesColor, setSelectedValuesColor] = useState([]);
    const initializeCheckboxesColor = () => {
        const initialCheckboxesColor = listColor.map((item) => ({
            id: item.id,
            label: item.name,
            checked: false,
        }));
        setCheckboxesColor(initialCheckboxesColor);
    };

    function handleSelectAllColor() {
        const updatedCheckboxesColor = checkboxesColor.map((checkbox) => ({
            ...checkbox,
            checked: !selectAllColor,
        }));
        setCheckboxesColor(updatedCheckboxesColor);
        setSelectAllColor(!selectAllColor);

        // Cập nhật selectedValuesSize dựa trên checkboxes đã chọn
        const selectedValuesColor = updatedCheckboxesColor
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => ({ id: checkbox.id, name: checkbox.label }));
        setSelectedValuesColor(selectedValuesColor);
    }

    function handleCheckboxColorChange(checkboxId) {
        const updatedCheckboxesColor = checkboxesColor.map((checkbox) =>
            checkbox.id === checkboxId ? { ...checkbox, checked: !checkbox.checked } : checkbox
        );
        setCheckboxesColor(updatedCheckboxesColor);

        // Cập nhật selectedValuesSize dựa trên checkboxes đã chọn
        const selectedValuesColor = updatedCheckboxesColor
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => ({ id: checkbox.id, name: checkbox.label }));
        setSelectedValuesColor(selectedValuesColor);
    }
    useEffect(() => {
        initializeCheckboxesColor();
    }, [listColor]);


    //Xử lý thêm chi tiết sản phẩm
    const [listAddMany, setListAddMany] = useState([]);
    useEffect(() => {
        console.log("trc khi selectedValuesColor:", selectedValuesColor);
        if (listAddMany.length > 0) {
            if (selectedValuesColor.length === 0 || selectedValuesSize.length === 0) {
                setListAddMany([]);
            } else {
                setListAddMany(listAddMany.filter(itemB => selectedValuesColor.some(itemA => itemA.id === itemB.colorId)));
            }
        }
    }, [selectedValuesColor]);
    useEffect(() => {
        console.log("trc khi selectedValuesSize:", selectedValuesSize);
        if (listAddMany.length > 0) {
            if (selectedValuesColor.length === 0 || selectedValuesSize.length === 0) {
                console.log("trc khi selectedValuesSize selectedValuesColor.length === 0 || selectedValuesSize.length === 0:", selectedValuesSize);
                setListAddMany([]);
            } else {
                console.log("trc khi selectedValuesSize else:", selectedValuesSize);
                setListAddMany(listAddMany.filter(itemB => selectedValuesSize.some(itemA => itemA.id === itemB.sizeId)));
            }
        }
    }, [selectedValuesSize]);

    const [shoesdetail, setShoesDetail] = useState({
        sizeId: "",
        colorId: "",
        quantity: "",
        price: "",
        status: "1"
    });

    const onInputChangeAdd = (e, idSize, idColor) => {
        const { name, value } = e.target;
        if (listAddMany.length > 0) {
            const existingItem = listAddMany.find(item => item && item.sizeId === idSize && item.colorId === idColor);
            console.log("existingItem", existingItem);
            if (existingItem) {
                setShoesDetail({
                    ...shoesdetail, sizeId: existingItem.sizeId,
                    colorId: existingItem.colorId,
                    quantity: existingItem.quantity,
                    price: existingItem.price,
                    status: existingItem.status, [name]: value, sizeId: idSize, colorId: idColor
                });
            } else {
                setShoesDetail({
                    ...shoesdetail, sizeId: "",
                    colorId: "",
                    quantity: "",
                    price: "",
                    status: "1", [name]: value, sizeId: idSize, colorId: idColor
                });
            }
        } else {
            setShoesDetail({ ...shoesdetail, [name]: value, sizeId: idSize, colorId: idColor });
        }
    };

    useEffect(() => {
        console.log('list', listAddMany);
    }, [listAddMany]);

    useEffect(() => {
        console.log(shoesdetail);
        console.log('list', listAddMany);
        if (listAddMany.length > 0) {
            const existingItem = listAddMany.find(item => item && item.sizeId === shoesdetail.sizeId && item.colorId === shoesdetail.colorId);
            console.log("existingItem", existingItem);
            if (existingItem) {
                const updatedArray = listAddMany.map(item => {
                    if (item && item.sizeId === shoesdetail.sizeId && item.colorId === shoesdetail.colorId) {
                        return {
                            ...item, sizeId: shoesdetail.sizeId, colorId: shoesdetail.colorId, quantity: shoesdetail.quantity, price: shoesdetail.price, status: shoesdetail.status

                        };
                    }
                    return item;
                });
                console.log("updatedArray", updatedArray);
                setListAddMany(updatedArray);
            } else {
                setListAddMany([...listAddMany, shoesdetail]);
            }
        } else {
            setListAddMany([shoesdetail]);
        }
    }, [shoesdetail]);
    //Kêt thúc conmbobox
    const generateNewFileName = (originalName, number) => {
        const extension = originalName.split('.').pop();
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        return `${baseName}_${number}.${extension}`;
    };

    const onClickAddMany = async () => {
        const formData1 = new FormData();
        try {
            if (selectedImages) {
                selectedImages.map((item, index) => {
                    const newName = generateNewFileName(item.file.name, item.i);
                    const modifiedFile = new File([item.file], newName, { type: item.file.type });
                    formData1.append(`files[${index}]`, modifiedFile);
                })
            }
            const shoesDataJson = JSON.stringify(listAddMany);
            formData1.append('data', shoesDataJson);
            await axiosInstance.post(`/admin/shoesdetail/${id}`, formData1);
            getListCheck();
            getAll();
            setSelectedImages([]);
            toast.success("Thêm thành công!");
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };
    //Khóa
    const lock = async (id) => {
        await axiosInstance.put(`/admin/shoesdetail/stop-business/${id}`);
        getAll();
    };
    const openlock = async (id) => {
        await axiosInstance.put(`/admin/shoesdetail/on-business/${id}`);
        getAll();
    };
    //End Hiển Thi Combobox

    const exportExcel = async () => {
        try {
            const requestData = ListShoesDetail.map(item => (
                item.shoesDetailSearchResponse
            ));
            const res = await axiosInstance.post(`/admin/shoesdetail/export/excel`, requestData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const blob = new Blob([res], { type: 'application/excel' });

            // Tạo một URL cho Blob và tạo một thẻ a để download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Shoesdetail_Export.xlsx';
            document.body.appendChild(a);
            a.click();

            // Giải phóng tài nguyên
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    };
    //Import Excel
    const fileInputRef = useRef(null);

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };
    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        const formData = new FormData();
        if (selectedFile) {
            formData.append('file', selectedFile);
            try {
                console.log(formData)
                const response = await axiosInstance.post(`/admin/shoesdetail/import-excel`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },responseType: 'blob'
                });
                console.log(response);
                getAll();
                toast.success("Nhập excel thành công");
                fileInputRef.current.value = null;
                const blob = new Blob([response], { type: 'application/excel' });

                // Tạo một URL cho Blob và tạo một thẻ a để download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'ShoesError.xlsx';
                document.body.appendChild(a);
                a.click();

                // navigate("/admin/product");
            } catch (error) {
                let errorMessage = "Lỗi từ máy chủ";
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                toast.error(errorMessage);
            }
        }
    };
    //Kết thúc import excel

    //Tải mẫu excel

    const taiMau = async () => {
        try {
            const res = await axiosInstance.get(`/admin/shoesdetail/export/pattern`, {
                responseType: 'blob'
            });

            const blob = new Blob([res], { type: 'application/excel' });

            // Tạo một URL cho Blob và tạo một thẻ a để download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Template_AddShoesDetails.xlsx';
            document.body.appendChild(a);
            a.click();

            // Giải phóng tài nguyên
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    };
    //Kết thúc tải mẫu excel

    const xuatPDF = async () => {
        try {
            const requestData = ListShoesDetail.map(item => (
                item.shoesDetailSearchResponse
            ));
            console.log(requestData);
            const res = await axiosInstance.post(`/admin/shoesdetail/export/pdf/${id}`, requestData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const blob = new Blob([res], { type: 'application/pdf' });

            // Tạo một URL cho Blob và tạo một thẻ a để download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Export_ShoesDetails.pdf';
            document.body.appendChild(a);
            a.click();

            // Giải phóng tài nguyên
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    };
    //End exportexcel
    //Báo cáo 
    const token = localStorage.token;
    const baoCaoPDF = async () => {
        try {
            const requestData = ListShoesDetail.map(item => (
                {
                    code: item.shoesDetailSearchResponse.code,
                    size: item.shoesDetailSearchResponse.size,
                    color: item.shoesDetailSearchResponse.color,
                    price: item.shoesDetailSearchResponse.price,
                    createdBy: item.shoesDetailSearchResponse.createdBy,
                    createdTime: item.shoesDetailSearchResponse.createdTime
                }
            ));
            console.log(requestData);
            const res = await axiosInstance.post(`/admin/shoesdetail/report/pattern/${id}`, { "staffShoesDetailReports": requestData }, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error(error);
        }
    };
    //End Báo cáo
    // Thêm mới 1 ctsp
    const [addone, setAddOne] = useState({
        id: "",
        sizeId: "",
        colorId: "",
        quantity: "",
        price: "",
        status: "1"
    });

    const [modalAdd, setModalAdd] = useState(false);
    const toggle = () => setModalAdd(!modalAdd);
    const [modalEdit, setModalEdit] = useState(false);
    const toggleEdit = () => setModalEdit(!modalEdit);
    useEffect(() => {
        if (modalAdd === false) {
            resetAddOne();
            setSelectedImages([]);
        }
    }, [modalAdd]);
    useEffect(() => {
        if (modalEdit === false) {
            resetAddOne();
            setSelectedImages([]);
        }
    }, [modalEdit]);

    useEffect(() => {
        console.log(addone);
    }, [addone]);

    const resetAddOne = () => {
        setAddOne({
            id: "",
            sizeId: "",
            colorId: "",
            quantity: "",
            price: "",
            status: "1"
        })
    }
    const handleAddFileImage = (e) => {
        const selectedFile = e.target.files[0];
        let randomId;
        do {
            // Tạo một ID ngẫu nhiên
            randomId = `id_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
            // Kiểm tra xem ID đã tồn tại trong mảng chưa
        } while (selectedImages.some((image) => image.id === randomId));
        if (selectedFile) {
            setSelectedImages([...selectedImages, {
                file: selectedFile,
                url: URL.createObjectURL(selectedFile),
                i: null,
                id: randomId
            }]);
        }
    };
    const handleAddFileImage2 = (e, id) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const updatedArray = selectedImages.map(item => {
                if (item && item.id === id) {
                    return {
                        ...item, file: selectedFile, url: URL.createObjectURL(selectedFile)
                    };
                }
                return item;
            });
            setSelectedImages(updatedArray);
        }
    };
    const handleAddFileImage3 = (id) => {
        const newArr = selectedImages.filter(item => item.id !== id);
        setSelectedImages(newArr);
    };
    const saveAdd = async () => {
        const formData1 = new FormData();
        try {
            if (addone.colorId) {
                if (selectedImages.length >= 3) {
                    selectedImages.map((item, index) => {
                        const newName = generateNewFileName(item.file.name, addone.colorId);
                        const modifiedFile = new File([item.file], newName, { type: item.file.type });
                        formData1.append(`files[${index}]`, modifiedFile);
                    })
                    const shoesDataJson = JSON.stringify([{
                        sizeId: addone.sizeId,
                        colorId: addone.colorId,
                        quantity: addone.quantity,
                        price: addone.price,
                        status: addone.status
                    }]);
                    formData1.append('data', shoesDataJson);
                    await axiosInstance.post(`/admin/shoesdetail/${id}`, formData1);
                    toggle();
                    getAll();
                    toast.success("Thêm thành công!");

                } else {
                    toast.error("Phải tải lên ít nhất 3 ảnh");
                }
            } else {
                toast.error("Màu không được để trống");
            }
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };
    const openEdit = async (id) => {
        try {
            const res = await axiosInstance.get(`/admin/shoesdetail/${id}`);
            console.log("res:", res);
            setAddOne({
                id: res.data.id,
                sizeId: res.data.sizeId,
                colorId: res.data.colorId,
                quantity: res.data.quantity,
                price: res.data.price,
                status: res.data.status
            })
            try {
                const res1 = await getAllImage(id);
                console.log("res1:", res1.data);
                if (res1 && res1.data) {
                    const updatedArray = res1.data.map(item => {
                        return {
                            ...item,
                            url: `https://s3-ap-southeast-1.amazonaws.com/imageshoestore/${item.imgURI}`,
                            id: item.id
                        };
                    });
                    setSelectedImages(updatedArray);
                }
                toggleEdit();

            } catch (eror) {
                console.log(eror);
                toggleEdit();
            }

        } catch (error) {
            console.log(error);
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }

    }
    const handleAddImage = async (e) => {
        const formData2 = new FormData();
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            try {
                formData2.append("files", selectedFile);
                const res1 = await postNewImage(addone.id, formData2);
                console.log(res1);
                if (res1 && res1.data) {
                    setSelectedImages([...selectedImages, {
                        url: `https://s3-ap-southeast-1.amazonaws.com/imageshoestore/${res1.data[0].imgURI}`,
                        id: res1.data[0].id
                    }]);

                }
            } catch (error) {
                let errorMessage = "Lỗi từ máy chủ";
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                toast.error(errorMessage);
            }
        }
    };
    const handleEditImage = async (e, id) => {
        const formData2 = new FormData();
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            try {
                formData2.append("file", selectedFile);
                const res1 = await updateImage(id, formData2);
                const updatedArray = selectedImages.map(item => {
                    if (item && item.id === id) {
                        return {
                            ...item,
                            url: `https://s3-ap-southeast-1.amazonaws.com/imageshoestore/${res1.data.imgURI}`
                        };
                    }
                    return item;
                });
                setSelectedImages(updatedArray);
            } catch (error) {
                let errorMessage = "Lỗi từ máy chủ";
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                toast.error(errorMessage);
            }
        }
    }
    const handleDeleteImage = async (id) => {
        try {
            await deleteImage({ data: [id] });
            const res1 = await getAllImage(addone.id);
            console.log("res1:", res1.data);
            if (res1 && res1.data) {
                const updatedArray = res1.data.map(item => {
                    return {
                        ...item,
                        url: `https://s3-ap-southeast-1.amazonaws.com/imageshoestore/${item.imgURI}`,
                        id: item.id
                    };
                });
                setSelectedImages(updatedArray);
            }
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    }
    const saveEdit = async () => {
        try {
            if (selectedImages.length >= 3) {
                await axiosInstance.put(`/admin/shoesdetail/${addone.id}`, {
                    sizeId: addone.sizeId,
                    colorId: addone.colorId,
                    quantity: addone.quantity,
                    price: addone.price,
                    status: addone.status
                });
                toggleEdit();
                getAll();
                toast.success("Cập nhật thành công!");
            } else {
                toast.error("Phải tải lên ít nhất 3 ảnh");
            }
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };

    //Kết thúc thêm mới 1 ctsp
    //Start Delete

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/admin/shoesdetail/delete`, { data: [id] });
            getAll();
            getListCheck();
            toast.success("Xóa thành công ");
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    }
    const [showActions, setShowActions] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const handleCheckboxChange = (idProduct) => {
        if (selectedItems.includes(idProduct)) {
            setSelectedItems(selectedItems.filter((id) => id !== idProduct));
            setShowActions(selectedItems.length - 1 > 0);
        } else {
            setSelectedItems([...selectedItems, idProduct]);
            setShowActions(true);
        }
    };
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
            setShowActions(false);
        } else {
            setSelectedItems(ListShoesDetail.map(listShoes => listShoes.shoesDetailSearchResponse.id));
            setShowActions(true);
        }
        setSelectAll(!selectAll);
    };
    const handleDeleteButtonClick = async () => {
        if (selectedItems.length > 0) {
            if (window.confirm("Bạn có chắc chắn muốn xóa các chi tiết  sản phẩm đã chọn không?")) {
                try {
                    await axiosInstance.delete(`/admin/shoesdetail/delete`, { data: selectedItems });
                    getAll();
                    setSelectedItems([]);
                    setShowActions(false);
                    getListCheck();
                    toast.success("Xóa thành công ");
                } catch (error) {
                    let errorMessage = "Lỗi từ máy chủ";
                    if (error.response && error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                    toast.error(errorMessage);
                }

            }
        }
    };

    //End Delete
    const [tt, setTT] = useState(false);
    const [thirdModal, setThirdModal] = useState(false);
    const toggleThirdModal = () => setThirdModal(!thirdModal);

    const formatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    });
    //Xuwr lys anhr khi theem
    const [file, setFile] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const handleFileChange1 = (e, x) => {
        console.log(x);
        const selectedFile = e.target.files[0];
        let randomId;
        do {
            // Tạo một ID ngẫu nhiên
            randomId = `id_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
            // Kiểm tra xem ID đã tồn tại trong mảng chưa
        } while (selectedImages.some((image) => image.id === randomId));
        if (selectedFile) {
            setSelectedImages([...selectedImages, {
                file: selectedFile,
                url: URL.createObjectURL(selectedFile),
                i: x,
                id: randomId
            }]);
        }
    };
    const handleFileChange2 = (e, id) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const updatedArray = selectedImages.map(item => {
                if (item && item.id === id) {
                    return {
                        ...item, file: selectedFile, url: URL.createObjectURL(selectedFile)
                    };
                }
                return item;
            });
            setSelectedImages(updatedArray);
        }
    };
    const handleFileChange3 = (id) => {
        const newArr = selectedImages.filter(item => item.id !== id);
        setSelectedImages(newArr);
    };
    useEffect(() => {
        console.log(selectedImages);
    }, [selectedImages]);
    const imageUrl = file ? URL.createObjectURL(file) : null;
    const imageSize = "110px";
    const imageStyle = {
        width: imageSize,
        height: imageSize,
    };
    const buttonStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#000",
        padding: "8px",
        cursor: "pointer",
        border: "1px dashed gray",
        width: imageSize,
        height: imageSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };
    const deleteIconStyle = {
        position: "absolute",
        top: 0,
        right: 0,
        cursor: "pointer",
        padding: "4px"
    };
    //Slide show
    const [sort, setSort] = useState('');
    const [sortStyle, setSortStyle] = useState('');
    const onClickSort = (a) => {
        const newSortOrder = sort === a && sortStyle === 'asc' ? 'desc' : 'asc';
        setSort(a);
        setSortStyle(newSortOrder);
    }
    useEffect(() => {
        getAll();
    }, [sort, sortStyle]);

    return (
        <>
            {/* Page content */}
            <Container fluid>
                <Row className="mb-4">
                    <div className="col">
                        <Card className="shadow mt-7 mb-4">
                            <CardBody>
                                <Row>
                                    <h6 className="heading-small text-dark mb-4 col-10">
                                        Thông tin sản phẩm
                                    </h6>
                                    <div className="col-2 d-flex justify-content-end">
                                        {tt === false && <FaAngleDown onClick={() => { console.log('Button clicked!'); setTT(true); }} />}
                                        {tt === true && <FaAngleUp onClick={() => setTT(false)} />}

                                    </div>
                                </Row>
                                {tt === true &&
                                    <div className="pl-lg-4">
                                        <Row className="m-1">
                                            <Col lg="4" className="text-center">
                                                <img src={`https://s3-ap-southeast-1.amazonaws.com/imageshoestore/${dataShoesById.imgURI}`} alt="Ảnh mô tả" />
                                            </Col>
                                            <Col lg="8">
                                                <Row className="mb-4 text-center">
                                                    <Col lg="12">
                                                        <label className="text-uppercase mb-0"><b style={{ fontSize: "16" }}>Mã -   {dataShoesById.code}</b></label><br />
                                                        <label className="text-uppercase mb-0"><b style={{ fontSize: "16" }}>Tên -   {dataShoesById.name}</b></label>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Hãng:  </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.brandName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Xuất xứ:   </label>
                                                    </Col>
                                                    <Col lg="4" className="text-left">
                                                        <label>{dataShoesById.originName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Thiết kế:  </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.designStyleName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Loại da:  </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.skinTypeName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Mũi giày:   </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.toeName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Đế giày:  </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.soleName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Lót giày:  </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.liningName}</label>
                                                    </Col>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Đệm giày:   </label>
                                                    </Col>
                                                    <Col lg="4">
                                                        <label>{dataShoesById.cushionName}</label>
                                                    </Col>
                                                </Row>
                                                {/* <Row>
                                                    <Col lg="2">
                                                        <label className="form-control-label">Mô tả:  </label>
                                                    </Col>
                                                    <Col lg="10">
                                                        <label>{dataShoesById.description}</label>
                                                    </Col>
                                                </Row> */}
                                            </Col>
                                        </Row>
                                    </div>
                                }
                            </CardBody>
                        </Card>
                        {listCheck.length > 0 &&
                            <>
                                <Card className="card-stats mb-xl-0">
                                    <CardHeader className="bg-transparent">

                                        <Row className="align-items-center">
                                            <div className="col d-flex">
                                                <h3 className="heading-small text-dark mb-0">
                                                    Danh sách chi tiết sản phẩm
                                                </h3>
                                                <div className="col text-right">
                                                    <Button
                                                        className="btn btn-outline-primary"
                                                        size="sm"
                                                        onClick={toggle}
                                                    >
                                                        Thêm mới
                                                    </Button>
                                                    <Button
                                                        className="btn btn-outline-primary"
                                                        onClick={(e) => e.preventDefault()}
                                                        size="sm"
                                                        onClick={taiMau}
                                                    >
                                                        Tải mẫu
                                                    </Button>
                                                    <input
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                    />

                                                    <Button
                                                        className="btn btn-outline-primary"
                                                        size="sm"
                                                        onClick={handleFileSelect}
                                                    >
                                                        Nhập Excel
                                                    </Button>
                                                    <Button
                                                        className="btn btn-outline-primary"
                                                        size="sm"
                                                        onClick={exportExcel}
                                                    >
                                                        Xuất Excel
                                                    </Button>
                                                    <Button
                                                        className="btn btn-outline-primary"
                                                        size="sm"
                                                        onClick={xuatPDF}
                                                    >
                                                        Xuất PDF
                                                    </Button>
                                                    {search.status === "-1" && ListShoesDetail && ListShoesDetail.length > 0 &&
                                                        <Button
                                                            className="btn btn-outline-primary"
                                                            size="sm"
                                                            onClick={baoCaoPDF}
                                                        >
                                                            Báo cáo
                                                        </Button>
                                                    }
                                                </div>
                                            </div>
                                        </Row>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="col">

                                            <Row className="align-items-center my-3">
                                                <div className="col-3 d-flex">
                                                    <Button color="warning" outline size="sm" onClick={toggleThirdModal}>
                                                        <FaFilter size="16px" className="mr-1" />Bộ lọc
                                                    </Button>

                                                    <Button color="warning" outline size="sm" onClick={toggle3}>
                                                        <FaQrcode className="mr-1" />QR Code
                                                    </Button>
                                                </div>
                                                <Col >
                                                    <InputGroup size="sm">
                                                        <Input type="search"
                                                            placeholder="Tìm kiếm theo mã..."
                                                            value={search.code}
                                                            name="code"
                                                            onChange={(e) => onInputChange(e)}
                                                        />
                                                        <InputGroupAddon addonType="append">
                                                            <InputGroupText>
                                                                <FaSearch />
                                                            </InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </Col>
                                                <Col>
                                                    <Input type="select" name="status" style={{ width: "150px" }} size="sm" onChange={(e) => onInputChange(e)} >
                                                        <option value=" ">Tất cả</option>
                                                        <option value="1">Đang kinh doanh</option>
                                                        <option value="0">Ngừng kinh doanh</option>
                                                        <option value="-1">Hết hàng</option>
                                                    </Input>
                                                </Col>



                                                <div className="col text-right">
                                                    {showActions && (
                                                        <Button
                                                            color="danger" outline
                                                            size="sm"
                                                            onClick={handleDeleteButtonClick}
                                                        >
                                                            Xóa tất cả
                                                        </Button>
                                                    )}
                                                </div>

                                            </Row>
                                            <Table responsive className="align-items-center table-flush">
                                                <thead className="thead-light">
                                                    <tr className="text-center">
                                                        <th>
                                                            <FormGroup check className="pb-4">
                                                                <Input
                                                                    type="checkbox"
                                                                    checked={selectAll}
                                                                    onChange={handleSelectAll}
                                                                />
                                                            </FormGroup>
                                                        </th>
                                                        <th style={{ color: "black" }}>STT</th>
                                                        <th style={{ color: "black" }}>Trạng thái</th>
                                                        <th style={{ color: "black" }}>Ảnh</th>
                                                        <th style={{ color: "black" }}>Mã <FaSort
                                                            style={{ cursor: "pointer" }}
                                                            className="text-muted"
                                                            onClick={() => onClickSort("code")} /></th>
                                                        <th style={{ color: "black" }}>Màu <FaSort
                                                            style={{ cursor: "pointer" }}
                                                            className="text-muted"
                                                            onClick={() => onClickSort("color")} /></th>
                                                        <th style={{ color: "black" }}>Size <FaSort
                                                            style={{ cursor: "pointer" }}
                                                            className="text-muted"
                                                            onClick={() => onClickSort("size")} /></th>
                                                        <th style={{ color: "black" }}>Số lượng <FaSort
                                                            style={{ cursor: "pointer" }}
                                                            className="text-muted"
                                                            onClick={() => onClickSort("quantity")} /></th>
                                                        <th style={{ color: "black" }}>Giá gốc <FaSort
                                                            style={{ cursor: "pointer" }}
                                                            className="text-muted"
                                                            onClick={() => onClickSort("price")} /></th>
                                                        <th style={{ color: "black" }}>Giá KM <FaSort
                                                            style={{ cursor: "pointer" }}
                                                            className="text-muted"
                                                            onClick={() => onClickSort("discountPrice")} /></th>
                                                        <th style={{ color: "black" }}>QR Code</th>
                                                        <th colSpan={2} style={{ position: "sticky", zIndex: '1', right: '0', color: "black" }}>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ListShoesDetail.length <= 0 &&
                                                        <th className="text-center" colSpan={17}>
                                                            Không có dữ liệu
                                                        </th>
                                                    }

                                                    {ListShoesDetail && ListShoesDetail.length > 0 &&
                                                        ListShoesDetail.map((item, index) => {
                                                            return (
                                                                <tr key={item.id} className="text-center">
                                                                    <td className="text-center">
                                                                        <FormGroup check className="pb-4">
                                                                            <Input
                                                                                type="checkbox"
                                                                                checked={selectedItems.includes(item.shoesDetailSearchResponse.id)}
                                                                                onChange={() => handleCheckboxChange(item.shoesDetailSearchResponse.id)}
                                                                            />

                                                                        </FormGroup>
                                                                    </td>
                                                                    <th scope="row"> {index + 1}</th>
                                                                    <td>
                                                                        {item.shoesDetailSearchResponse.status === (-1) ?
                                                                            <Badge color={statusMapping[2]?.color || statusMapping.default.color}>
                                                                                {statusMapping[2]?.label || statusMapping.default.label}
                                                                            </Badge>
                                                                            :
                                                                            <Badge color={statusMapping[item.shoesDetailSearchResponse.status]?.color || statusMapping.default.color}>
                                                                                {statusMapping[item.shoesDetailSearchResponse.status]?.label || statusMapping.default.label}
                                                                            </Badge>
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <SlideShow images={item.imageDTOS} imageSize={"80px"} />
                                                                    </td>
                                                                    <td>{item.shoesDetailSearchResponse.code}</td>
                                                                    <td>{item.shoesDetailSearchResponse.color}</td>
                                                                    <td>{item.shoesDetailSearchResponse.size}</td>
                                                                    <td>{item.shoesDetailSearchResponse.quantity}</td>
                                                                    <td>{formatter.format(item.shoesDetailSearchResponse.price)}</td>
                                                                    <td>{formatter.format(item.shoesDetailSearchResponse.discountPrice)}</td>
                                                                    <td>
                                                                        <img
                                                                            src={`https://s3-ap-southeast-1.amazonaws.com/imageshoestore/${item.shoesDetailSearchResponse.qrcodeURI}`}
                                                                            alt=""
                                                                            style={{ width: "80px" }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ position: "sticky", zIndex: '1', right: '0', background: "#fff" }}>
                                                                        <Tooltip title="Chỉnh sửa">
                                                                            <Button color="link" size="sm" disabled={item.shoesDetailSearchResponse.status === 0 ? true : false} onClick={() => openEdit(item.shoesDetailSearchResponse.id)}>
                                                                                <FaEdit color="primary" />
                                                                            </Button>
                                                                        </Tooltip>
                                                                        {item.shoesDetailSearchResponse.status === 0 &&
                                                                            <Popconfirm
                                                                                title="Bạn có chắc muốn kích hoạt sản phẩm này không?"
                                                                                onConfirm={() => openlock(item.shoesDetailSearchResponse.id)}
                                                                                okText="Xác nhận"
                                                                                cancelText="Hủy"
                                                                            >
                                                                                <Tooltip title="Kích hoạt">
                                                                                    <Button color="link" size="sm">
                                                                                        <FaLockOpen color="primary" />
                                                                                    </Button>
                                                                                </Tooltip>
                                                                            </Popconfirm>
                                                                        }
                                                                        {(item.shoesDetailSearchResponse.status === 1 || item.shoesDetailSearchResponse.status === (-1)) &&
                                                                            <Popconfirm
                                                                                title="Bạn có chắc muốn ngừng kích hoạt sản phẩm này không?"
                                                                                onConfirm={() => lock(item.shoesDetailSearchResponse.id)}
                                                                                okText="Xác nhận"
                                                                                cancelText="Hủy"
                                                                            >
                                                                                <Tooltip title="Ngừng kích hoạt">
                                                                                    <Button color="link" size="sm" >
                                                                                        <FaLock color="primary" />
                                                                                    </Button>
                                                                                </Tooltip>
                                                                            </Popconfirm>
                                                                        }
                                                                        <Popconfirm
                                                                            title={`Bạn có muốn xóa giày mã ${item.shoesDetailSearchResponse.code} giày này không ?`}
                                                                            onConfirm={() => handleDelete(item.shoesDetailSearchResponse.id)}
                                                                            okText="Xóa"
                                                                            cancelText="Hủy"
                                                                        >
                                                                            <Tooltip title="Xóa">
                                                                                <Button color="link" size="sm" >
                                                                                    <FaTrash color="primary" />
                                                                                </Button>
                                                                            </Tooltip>
                                                                        </Popconfirm>

                                                                    </td>
                                                                </tr>
                                                            )

                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                            <Row className="mt-4">
                                                <Col lg={6}>
                                                    <div style={{ fontSize: 14 }}>
                                                        Đang xem <b>1</b> đến <b>{totalElements < size ? totalElements : size}</b> trong tổng số <b>{totalElements}</b> mục
                                                    </div>
                                                </Col>
                                                <Col style={{ fontSize: 14 }} lg={2}>
                                                    <Row>
                                                        <span>Xem </span>&nbsp;
                                                        <span>
                                                            <Input type="select" name="status" style={{ width: "60px", fontSize: 14 }} size="sm" onChange={(e) => onChangeSize(e)} className="mt--1">
                                                                <option value="5">5</option>
                                                                <option value="10">10</option>
                                                                <option value="25">25</option>
                                                                <option value="50">50</option>
                                                                <option value="100">100</option>
                                                            </Input>
                                                        </span>&nbsp;
                                                        <span> mục</span>
                                                    </Row>

                                                </Col>
                                                <Col lg={4} style={{ fontSize: 11 }} className="mt--1">
                                                    <ReactPaginate
                                                        breakLabel="..."
                                                        nextLabel=">"
                                                        pageRangeDisplayed={1} // Number of pages to display on each side of the selected page
                                                        pageCount={totalPages} // Total number of pages
                                                        previousLabel="<"
                                                        onPageChange={handlePageClick}
                                                        renderOnZeroPageCount={null}
                                                        pageClassName="page-item"
                                                        pageLinkClassName="page-link"
                                                        previousClassName="page-item"
                                                        previousLinkClassName="page-link"
                                                        nextClassName="page-item"
                                                        nextLinkClassName="page-link"
                                                        breakClassName="page-item"
                                                        breakLinkClassName="page-link"
                                                        containerClassName="pagination"
                                                        activeClassName="active"
                                                        marginPagesDisplayed={1}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        {/*  */}
                                    </CardBody>
                                </Card>
                            </>
                        }
                        {/* Bắt đầu combobox */}
                        {listCheck.length <= 0 &&
                            <Card className="card-stats mb-xl-0">
                                <Row className="align-items-center mb-2">
                                    <Col lg="6">
                                        <Card className="shadow m-4">
                                            <CardBody>
                                                <CardTitle
                                                    tag="h5"
                                                    className="text-uppercase text-muted mb-0"
                                                >
                                                    <h3>Màu</h3>
                                                </CardTitle>
                                                <FormGroup check>
                                                    <div className="mb-2">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectAllColor}
                                                                onChange={handleSelectAllColor}
                                                            />&nbsp;&nbsp;
                                                            Tất cả
                                                        </label>
                                                    </div>
                                                    <Row>
                                                        <Col lg={2}></Col>
                                                        <Col lg={10}>
                                                            <Row>
                                                                {checkboxesColor.map((checkbox) => (
                                                                    <Col lg={6}>
                                                                        <label key={checkbox.id}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checkbox.checked}
                                                                                onChange={() => handleCheckboxColorChange(checkbox.id)}
                                                                            />&nbsp;&nbsp;
                                                                            {checkbox.label}
                                                                        </label>
                                                                    </Col>
                                                                ))}
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            </CardBody>
                                        </Card>

                                    </Col>
                                    <Col lg="6">
                                        <Card className="shadow m-4">

                                            <CardBody>
                                                <CardTitle
                                                    tag="h5"
                                                    className="text-uppercase text-muted mb-0"
                                                >
                                                    <h3>Size</h3>
                                                </CardTitle>
                                                <FormGroup check>
                                                    <div className="mb-2">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectAllSize}
                                                                onChange={handleSelectAllSize}
                                                            />&nbsp;&nbsp;
                                                            Tất cả
                                                        </label>
                                                    </div>
                                                    <Row>
                                                        <Col lg={2}></Col>
                                                        <Col lg={10}>
                                                            <Row>
                                                                {checkboxesSize.map((checkbox) => (
                                                                    <Col lg={6}>
                                                                        <label key={checkbox.id}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checkbox.checked}
                                                                                onChange={() => handleCheckboxSizeChange(checkbox.id)}
                                                                            />&nbsp;&nbsp;
                                                                            {checkbox.label}
                                                                        </label>
                                                                    </Col>
                                                                ))}
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            </CardBody>
                                        </Card>

                                    </Col>
                                </Row>
                                {/*  */}
                                {selectedValuesColor.length > 0 && selectedValuesSize.length > 0 &&
                                    < Row >
                                        <Col lg="12">
                                            <Card className="shadow m-4">
                                                <CardBody>
                                                    {selectedValuesColor.map((itemColor, index) => (
                                                        <>
                                                            <Table className="align-items-center table-flush mb-4" responsive >
                                                                {/* className="" color='gray' style={{ fontFamily: "Arial" }}> */}

                                                                <th colSpan={4} className="text-center" style={{ fontFamily: "Open sans", fontSize: "16", background: "rgba(192, 192, 192, 0.2)", borderRadius: "3" }}>
                                                                    <b>
                                                                        Các sản phẩm màu {itemColor.name}
                                                                    </b>
                                                                </th>

                                                                <tr className="text-center">
                                                                    <th>Size</th>
                                                                    <th>Giá</th>
                                                                    <th>Số lượng</th>
                                                                    <th>Trạng Thái</th>
                                                                </tr>

                                                                {selectedValuesSize.map((value) => (
                                                                    <tbody>
                                                                        <tr key={value.id} >
                                                                            <td className="col-1">{value.name}</td>
                                                                            <td className="col-3">
                                                                                <Input
                                                                                    id={`price_${value.id}`}
                                                                                    name="price"
                                                                                    placeholder="Nhập giá"
                                                                                    value={value.price}
                                                                                    onChange={(e) => onInputChangeAdd(e, value.id, itemColor.id)}

                                                                                />
                                                                            </td>
                                                                            <td className="col-3">
                                                                                <Input
                                                                                    id={`quantity_${value.id}`}
                                                                                    name="quantity"
                                                                                    placeholder="Nhập số lượng"
                                                                                    value={value.quantity}
                                                                                    onChange={(e) => onInputChangeAdd(e, value.id, itemColor.id)}
                                                                                />
                                                                            </td>
                                                                            <td >
                                                                                <Input id={`status_${value.id}`} type="select" name="status" value={value.status}
                                                                                    onChange={(e) => onInputChangeAdd(e, value.id, itemColor.id)}
                                                                                >
                                                                                    <option value='1'>
                                                                                        Hoạt động
                                                                                    </option>
                                                                                    <option value='0'>
                                                                                        Ngừng hoạt động
                                                                                    </option>
                                                                                </Input>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>

                                                                ))}
                                                            </Table >

                                                            <Col className="mb-5">
                                                                <div className="d-flex justify-content-center">
                                                                    {selectedImages.length > 0 && selectedImages.filter((itemA) => itemA.i === itemColor.id).map((itemA, x) => (
                                                                        <div className="mr-4"
                                                                            key={itemA.id}
                                                                            style={{
                                                                                position: "relative",
                                                                                width: imageSize,
                                                                                height: imageSize,
                                                                            }}
                                                                        >
                                                                            <img
                                                                                alt="preview"
                                                                                src={itemA.url}
                                                                                style={imageStyle}
                                                                            />
                                                                            <Input
                                                                                type="file"
                                                                                id={`image_${index}_${x}`}
                                                                                style={{ display: "none" }}
                                                                                onChange={(e) => { handleFileChange2(e, itemA.id) }}
                                                                            />
                                                                            <Label htmlFor={`image_${index}_${x}`} style={buttonStyle}>
                                                                                +
                                                                            </Label>
                                                                            <div style={deleteIconStyle} >
                                                                                <span role="img" aria-label="Delete" style={{ fontSize: "15px" }} onClick={() => handleFileChange3(itemA.id)}>
                                                                                    <FaTrash color="red" />
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {selectedImages.filter((itemA) => itemA.i === itemColor.id).length < 5 &&
                                                                        <div
                                                                            style={{
                                                                                position: "relative",
                                                                                width: imageSize,
                                                                                height: imageSize,
                                                                            }}
                                                                        >
                                                                            {imageUrl && (
                                                                                <img
                                                                                    alt="preview"
                                                                                    src={imageUrl}
                                                                                    style={imageStyle}
                                                                                />
                                                                            )}
                                                                            <Input
                                                                                type="file"
                                                                                id={`image_${index}`}
                                                                                style={{ display: "none" }}
                                                                                onChange={(e) => { handleFileChange1(e, itemColor.id) }}
                                                                            />
                                                                            {/* // */}
                                                                            <Label htmlFor={`image_${index}`} style={buttonStyle}>
                                                                                +
                                                                            </Label>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </Col>
                                                        </>
                                                    ))}

                                                    <Row className="text-center">
                                                        <Col>
                                                            <Button onClick={onClickAddMany} color="primary">Thêm</Button>
                                                        </Col>
                                                    </Row>
                                                </CardBody >
                                            </Card>
                                        </Col>
                                    </Row>
                                }
                                {/*  */}

                            </Card>
                        }
                        {/* Kết thúc combobox */}
                    </div >
                </Row >

            </Container >
            <Modal
                isOpen={modalAdd}
                toggle={toggle}
                backdrop={'static'}
                keyboard={false}
                style={{ maxWidth: '700px' }}
            >
                <ModalHeader toggle={toggle}>
                    <h3 className="heading-small text-muted mb-0">Thêm mới</h3>
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <div className="pl-lg-4">
                            <Row>
                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-email"
                                        >
                                            Màu
                                        </label>
                                        <Input id="btn_select_tt" type="select" name="sizeId" value={addone.colorId}
                                            onChange={(e) => setAddOne({
                                                ...addone,
                                                colorId: e.target.value
                                            })}>
                                            <option value=" "> -- Chọn --  </option>
                                            {listColor && listColor.length > 0 &&
                                                listColor.map((item, index) => {
                                                    return (
                                                        <option value={item.id} key={item.id} >
                                                            {item.name}
                                                        </option>
                                                    )

                                                })
                                            }
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-email"
                                        >
                                            Size
                                        </label>
                                        <Input id="btn_select_tt" type="select" name="sizeId" value={addone.sizeId}
                                            onChange={(e) => setAddOne({
                                                ...addone,
                                                sizeId: e.target.value
                                            })}>
                                            <option value=" "> -- Chọn --  </option>
                                            {listSize && listSize.length > 0 &&
                                                listSize.map((item, index) => {
                                                    return (
                                                        <option value={item.id} key={item.id} >
                                                            {item.name}
                                                        </option>
                                                    )

                                                })
                                            }
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label className="form-control-label">
                                            Giá
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            type="text"
                                            value={addone.price}
                                            onChange={(e) =>
                                                setAddOne({
                                                    ...addone,
                                                    price: e.target.value
                                                })}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label className="form-control-label">
                                            Số lượng
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            type="text"
                                            value={addone.quantity}
                                            onChange={(e) =>
                                                setAddOne({
                                                    ...addone,
                                                    quantity: e.target.value
                                                })}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col lg="12">
                                    <FormGroup>
                                        <label className="form-control-label">
                                            Trạng thái
                                        </label>
                                        <Input type="select" name="status" value={addone.status}
                                            onChange={(e) =>
                                                setAddOne({
                                                    ...addone,
                                                    status: e.target.value
                                                })}
                                        >
                                            <option value='1'>
                                                Hoạt động
                                            </option>
                                            <option value='0'>
                                                Ngừng hoạt động
                                            </option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col lg="12">
                                    <div className="d-flex justify-content-center">
                                        {selectedImages.length > 0 && selectedImages.map((itemA, x) => (
                                            <div className="mr-4"
                                                key={itemA.id}
                                                style={{
                                                    position: "relative",
                                                    width: imageSize,
                                                    height: imageSize,
                                                }}
                                            >
                                                <img
                                                    alt="preview"
                                                    src={itemA.url}
                                                    style={imageStyle}
                                                />
                                                <Input
                                                    type="file"
                                                    id={`image_${x}`}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => { handleAddFileImage2(e, itemA.id) }}
                                                />
                                                <Label htmlFor={`image_${x}`} style={buttonStyle}>
                                                    +
                                                </Label>
                                                <div style={deleteIconStyle} >
                                                    <span role="img" aria-label="Delete" style={{ fontSize: "15px" }} onClick={() => handleAddFileImage3(itemA.id)}>
                                                        <FaTrash color="red" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedImages.length < 5 &&
                                            <div
                                                style={{
                                                    position: "relative",
                                                    width: imageSize,
                                                    height: imageSize,
                                                }}
                                            >
                                                {imageUrl && (
                                                    <img
                                                        alt="preview"
                                                        src={imageUrl}
                                                        style={imageStyle}
                                                    />
                                                )}
                                                <Input
                                                    type="file"
                                                    id={`image`}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => { handleAddFileImage(e) }}
                                                />
                                                {/* // */}
                                                <Label htmlFor={`image`} style={buttonStyle}>
                                                    +
                                                </Label>
                                            </div>
                                        }
                                    </div>

                                </Col>

                            </Row>
                        </div>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <div className="text-center">
                        <Button color="primary" size="sm" onClick={(e) => saveAdd(e)}>
                            Thêm mới
                        </Button>{' '}
                        <Button color="primary" size="sm" onClick={resetAddOne}>
                            Reset
                        </Button>
                        <Button color="danger" size="sm" onClick={toggle} >
                            Close
                        </Button>
                    </div>
                </ModalFooter>
            </Modal >
            <Modal
                isOpen={modalEdit}
                toggle={toggleEdit}
                backdrop={'static'}
                keyboard={false}
                style={{ maxWidth: '700px' }}
            >
                <ModalHeader toggle={toggleEdit}>
                    <h3 className="heading-small text-muted mb-0">Cập nhật</h3>
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <div className="pl-lg-4">
                            <Row>
                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-email"
                                        >
                                            Màu
                                        </label>
                                        <Input id="btn_select_tt" type="select" name="sizeId" value={addone.colorId}
                                            disabled
                                            onChange={(e) => setAddOne({
                                                ...addone,
                                                colorId: e.target.value

                                            })}>
                                            <option value=" "> -- Chọn --  </option>
                                            {listColor && listColor.length > 0 &&
                                                listColor.map((item, index) => {
                                                    return (
                                                        <option value={item.id} key={item.id} >
                                                            {item.name}
                                                        </option>
                                                    )

                                                })
                                            }
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-email"
                                        >
                                            Size
                                        </label>
                                        <Input id="btn_select_tt" type="select" name="sizeId" value={addone.sizeId} disabled
                                            onChange={(e) => setAddOne({
                                                ...addone,
                                                sizeId: e.target.value
                                            })}>
                                            <option value=" "> -- Chọn --  </option>
                                            {listSize && listSize.length > 0 &&
                                                listSize.map((item, index) => {
                                                    return (
                                                        <option value={item.id} key={item.id} >
                                                            {item.name}
                                                        </option>
                                                    )

                                                })
                                            }
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label className="form-control-label">
                                            Giá
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            type="text"
                                            value={addone.price}
                                            onChange={(e) =>
                                                setAddOne({
                                                    ...addone,
                                                    price: e.target.value
                                                })}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label className="form-control-label">
                                            Số lượng
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            type="text"
                                            value={addone.quantity}
                                            onChange={(e) =>
                                                setAddOne({
                                                    ...addone,
                                                    quantity: e.target.value
                                                })}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col lg="12">
                                    <FormGroup>
                                        <label className="form-control-label">
                                            Trạng thái
                                        </label>
                                        <Input type="select" name="status" value={addone.status}
                                            onChange={(e) =>
                                                setAddOne({
                                                    ...addone,
                                                    status: e.target.value
                                                })}
                                        >
                                            <option value='1'>
                                                Hoạt động
                                            </option>
                                            <option value='0'>
                                                Ngừng hoạt động
                                            </option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col lg="12">
                                    <div className="d-flex justify-content-center">
                                        {selectedImages.length > 0 && selectedImages.map((itemA, x) => (
                                            <div className="mr-4"
                                                key={itemA.id}
                                                style={{
                                                    position: "relative",
                                                    width: imageSize,
                                                    height: imageSize,
                                                }}
                                            >
                                                <img
                                                    alt="preview"
                                                    src={itemA.url}
                                                    style={imageStyle}
                                                />
                                                <Input
                                                    type="file"
                                                    id={`image_${x}`}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => { handleEditImage(e, itemA.id) }}
                                                />
                                                <Label htmlFor={`image_${x}`} style={buttonStyle}>
                                                    +
                                                </Label>
                                                <div style={deleteIconStyle} >
                                                    <span role="img" aria-label="Delete" style={{ fontSize: "15px" }} onClick={() => handleDeleteImage(itemA.id)}>
                                                        <FaTrash color="red" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedImages.length < 5 &&
                                            <div
                                                style={{
                                                    position: "relative",
                                                    width: imageSize,
                                                    height: imageSize,
                                                }}
                                            >

                                                <Input
                                                    type="file"
                                                    id={`image`}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => { handleAddImage(e) }}
                                                />
                                                <Label htmlFor={`image`} style={buttonStyle}>
                                                    +
                                                </Label>
                                            </div>
                                        }

                                    </div>

                                </Col>

                            </Row>
                        </div>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <div className="text-center">
                        <Button color="primary" size="sm" onClick={(e) => saveEdit(e)}>
                            Cập nhật
                        </Button>{' '}
                        <Button color="danger" size="sm" onClick={toggleEdit} >
                            Close
                        </Button>
                    </div>
                </ModalFooter>
            </Modal >
            <Modal
                isOpen={thirdModal}
                toggle={toggleThirdModal}
                style={{ maxWidth: '355px', right: 'unset', left: 0, position: 'fixed', marginLeft: '252px', marginRight: 0, top: "-27px" }}
                backdrop={false}
            >
                <ModalHeader toggle={toggleThirdModal}>
                    <h3 className="heading-small text-muted mb-0">Bộ lọc tìm kiếm</h3>
                </ModalHeader>
                <ModalBody style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <Form>
                        <Row>
                            <Col lg="6">
                                <FormGroup>
                                    <label
                                        className="form-control-label"
                                        htmlFor="input-email"
                                    >
                                        Size
                                    </label>
                                    <Input id="btn_select_tt" type="select" name="sizeId" value={search.sizeId} size="sm"
                                        onChange={(e) => onInputChange(e)}>
                                        <option value=" "> -- Chọn --  </option>
                                        {listSizeById && listSizeById.length > 0 &&
                                            listSizeById.map((item, index) => {
                                                return (
                                                    <option value={item.id} key={item.id} >
                                                        {item.name}
                                                    </option>
                                                )

                                            })
                                        }
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col lg="6">
                                <FormGroup>
                                    <label
                                        className="form-control-label"
                                        htmlFor="input-email"
                                    >
                                        Color
                                    </label>
                                    <Input id="btn_select_tt" type="select" name="colorId" value={search.colorId} size="sm"
                                        onChange={(e) => onInputChange(e)}>
                                        <option value=" "> -- Chọn --  </option>
                                        {listColorById && listColorById.length > 0 &&
                                            listColorById.map((item, index) => {
                                                return (
                                                    <option value={item.id} key={item.id} >
                                                        {item.name}
                                                    </option>
                                                )

                                            })
                                        }
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col lg="12">
                                <FormGroup>
                                    <label
                                        className="form-control-label"
                                        htmlFor="input-username"
                                    >
                                        Người tạo
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        id="find_createdAt"
                                        name="createdBy"
                                        value={search.createdBy}
                                        onChange={(e) => onInputChange(e)}
                                        placeholder="Nhập người tạo"
                                        size="sm"

                                    />

                                </FormGroup>
                            </Col>
                            <Col lg="12" xl="12">
                                <FormGroup>
                                    <Label for="find_createdDate" className="form-control-label">
                                        Ngày tạo:
                                    </Label>
                                    <Row>
                                        <Col xl={6}>
                                            <Input
                                                type="date"
                                                className="form-control-alternative"
                                                id="find_createdDate"
                                                name="fromDateStr"
                                                value={search.fromDateStr}
                                                onChange={(e) => onInputChange(e)}
                                                size="sm"
                                            />
                                        </Col>
                                        <Col xl={6}>
                                            <Input
                                                type="date"
                                                className="form-control-alternative"
                                                id="find_createdDate"
                                                name="toDateStr"
                                                value={search.toDateStr}
                                                onChange={(e) => onInputChange(e)}
                                                size="sm"
                                            />

                                        </Col>
                                    </Row>

                                </FormGroup>
                            </Col>
                            <Col lg="12" xl="12">
                                <FormGroup>
                                    <Label for="find_code" className="form-control-label">
                                        Số lượng:
                                    </Label>
                                    <Row>
                                        <Col xl={5}>
                                            <Input

                                                id="find_code"
                                                name="fromQuantity"
                                                placeholder="Nhập số lượng"
                                                value={search.fromQuantity}
                                                onChange={(e) => onInputChange(e)}
                                                size="sm"
                                            />
                                        </Col>
                                        <Label for="find_code" xl={2} className="form-control-label text-center">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </Label>
                                        <Col xl={5}>
                                            <Input

                                                id="find_code"
                                                name="toQuantity"
                                                placeholder="Nhập số lượng"
                                                value={search.toQuantity}
                                                onChange={(e) => onInputChange(e)}
                                                size="sm"
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </Col>
                            <Col lg="12" xl="12">
                                <FormGroup>
                                    <Label for="find_code" className="form-control-label">
                                        Giá:
                                    </Label>
                                    <Row>
                                        <Col xl={5}>
                                            <Input
                                                id="find_code"
                                                name="fromPrice"
                                                placeholder="Nhập giá"
                                                value={search.fromPrice}
                                                onChange={(e) => onInputChange(e)}
                                                size="sm"
                                            />
                                        </Col>
                                        <Label for="find_code" xl={2} className="form-control-label text-center">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </Label>
                                        <Col xl={5}>
                                            <Input
                                                id="find_code"
                                                name="toPrice"
                                                placeholder="Nhập giá"
                                                value={search.toPrice}
                                                onChange={(e) => onInputChange(e)}
                                                size="sm"
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <div className="row w-100">
                        <div className="col-4">
                            <Button color="primary" outline size="sm" block onClick={resetSearch}>
                                Làm mới
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button color="primary" outline size="sm" block >
                                Lọc
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button color="danger" outline size="sm" block onClick={toggleThirdModal}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </ModalFooter>

            </Modal>

            {/* QRCode */}
            <Modal isOpen={modal3} toggle={toggle3} size="sm">
                <ModalHeader toggle={toggle3}>QR Code Scanner</ModalHeader>
                <ModalBody>
                    <QrReader
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: "100%" }}
                        facingMode="environment"
                    />
                    <p>{result}</p>
                </ModalBody>
            </Modal>

        </>
    );
};

export default ListShoesDetail;

