import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaLock, FaLockOpen } from 'react-icons/fa';
import { FaSort } from "react-icons/fa6";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "services/custommize-axios";
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { isToday } from 'date-fns';
// reactstrap components
import Switch from 'react-input-switch';
import {
    Row, Col, Form, FormGroup, Input, Button, Table, Badge, Modal,
    ModalBody, ModalFooter, ModalHeader, InputGroup, InputGroupAddon, InputGroupText
} from "reactstrap";

const SaleBills = () => {

    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const handleModal = () => {
        resetForm();
        setModal(true);
    }

    const [thirdModal, setThirdModal] = useState(false);
    const toggleThirdModal = () => setThirdModal(!thirdModal);
    const handleModal3 = () => {
        setThirdModal(true);
    }

    const formatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    });

    const [discounts, setDiscounts] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    const [queryParams, setQueryParams] = useState({
        page: 0,
        size: 10,
        type: 0,
        code: "",
        name: "",
        minPrice: "",
        maxPrice: "",
        fromDate: "",
        toDate: "",
        status: "",
        isdelete: 0,
    });


    //loads table
    const fetchData = async () => {
        try {
            const response = await axiosInstance.get("/vouchers/getAll", {
                params: queryParams
            });
            setDiscounts(response.content);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [queryParams]);

    const handlePageChange = ({ selected }) => {
        setQueryParams(prevParams => ({ ...prevParams, page: selected }));
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setQueryParams({ ...queryParams, size: newSize, page: 0 });
    };

    const calculateIndex = (index) => {
        return index + 1 + queryParams.page * queryParams.size;
    };

    const statusMapping = {
        0: { color: 'danger', label: 'Kích hoạt' },
        1: { color: 'success', label: 'Chờ kích hoạt' },
        2: { color: 'warning', label: 'Ngừng kích hoạt' },
    };

    //sắp xếp
    const handleSort = (field) => {
        const newSortOrder = queryParams.sortField === field && queryParams.sortOrder === 'asc' ? 'desc' : 'asc';
        setQueryParams({
            ...queryParams,
            sortField: field,
            sortOrder: newSortOrder,
        });
    };

    //lọc
    const resetFilters = () => {
        document.getElementById("minPrice").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("status").value = "";
        document.getElementById("fromDate").value = "";
        document.getElementById("toDate").value = "";
        document.getElementById("sale").value = "";
    };

    const handleFilter = () => {
        // Extract values from modal form fields
        const minPrice = document.getElementById("minPrice").value;
        const maxPrice = document.getElementById("maxPrice").value;
        const status = document.getElementById("status").value;
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;
        const saleMethod = document.getElementById("sale").value;
        setQueryParams({
            ...queryParams,
            minPrice,
            maxPrice,
            status,
            fromDate,
            toDate,
            saleMethod,
        });
        toggleThirdModal();
    };

    //checkbox
    const [showActions, setShowActions] = useState(false);
    const handleCheckboxChange = (idDiscount) => {
        if (selectedItems.includes(idDiscount)) {
            setSelectedItems(selectedItems.filter((id) => id !== idDiscount));
            setShowActions(selectedItems.length - 1 > 0);
        } else {
            setSelectedItems([...selectedItems, idDiscount]);
            setShowActions(true);
        }
    };
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
            setShowActions(false);
        } else {
            setSelectedItems(discounts.map(discount => discount.id));
            setShowActions(true);
        }
        setSelectAll(!selectAll);
    };



    //click on selected
    const [formData, setFormData] = useState({
        id: null,
        code: "",
        name: "",
        minPrice: "",
        sale: false,
        quantity: 0,
        salePercent: "",
        salePrice: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "",
    });

    const handleRowClick = (discount) => {
        if (discount.salePercent !== null) {
            setFormData({
                id: discount.id,
                code: discount.code,
                name: discount.name,
                quantity: discount.quantity,
                startDate: discount.startDate,
                endDate: discount.endDate,
                description: discount.description,
                salePercent: discount.salePercent,
                salePrice: "",
                minPrice: discount.minPrice,
                sale: true,
                status: discount.status
            });
        }
        if (discount.salePrice !== null) {
            setFormData({
                id: discount.id,
                code: discount.code,
                name: discount.name,
                quantity: discount.quantity,
                startDate: discount.startDate,
                endDate: discount.endDate,
                description: discount.description,
                salePercent: "",
                salePrice: discount.salePrice,
                minPrice: discount.minPrice || "",
                sale: false,
                status: discount.status
            });
        }

        setModal(true);
    };

    //reset
    const resetForm = () => {
        setFormData({
            code: "",
            name: "",
            startDate: "",
            endDate: "",
            description: "",
            salePercent: "",
            minPrice: "",
            salePrice: "",
            sale: false

        });
    };

    //save
    const formatDateTime = (dateString) => {
        const parsedDate = parseISO(dateString, "dd/MM/yyyy hh:mm a", new Date());
        return format(parsedDate, "yyyy-MM-dd HH:mm", { locale: vi });
    };

    const saveDiscount = async () => {
        try {
            const formattedStartDate = formatDateTime(formData.startDate);
            const formattedEndDate = formatDateTime(formData.endDate);

            if (!formattedStartDate || !formattedEndDate) {
                toast.error("Ngày bắt đầu và ngày kết thúc không được để trống");
                return;
            }

            // Kiểm tra ngày bắt đầu có phải từ ngày hôm nay không
            const startDateTime = new Date(formattedStartDate);
            const today = new Date();
            if (!isToday(startDateTime)) {
                toast.error("Ngày bắt đầu phải từ ngày hôm nay hoặc sau ngày hôm nay");
                return;
            }

            // Kiểm tra ngày kết thúc có lớn hơn ngày bắt đầu không
            const endDateTime = new Date(formattedEndDate);
            if (endDateTime <= startDateTime) {
                toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu");
                return;
            }


            if (formData.id) {
                await axiosInstance.put(`/vouchers/updateVoucher`, {
                    id: formData.id,
                    code: formData.code,
                    name: formData.name,
                    minPrice: formData.minPrice,
                    sale: formData.sale,
                    quantity: formData.quantity,
                    description: formData.description,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    salePercent: formData.sale ? formData.salePercent : null,
                    salePrice: formData.sale ? null : formData.salePrice,
                    status: formData.status
                });

                fetchData();

                toast.success("Cập nhật thành công!");
            } else {
                await axiosInstance.post('/vouchers/createVoucher', {
                    code: formData.code,
                    name: formData.name,
                    minPrice: formData.minPrice,
                    sale: formData.sale,
                    quantity: formData.quantity,
                    description: formData.description,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    salePercent: formData.sale ? formData.salePercent : null,
                    salePrice: formData.sale ? null : formData.salePrice,
                });

                fetchData();
                toast.success("Thêm mới thành công!");
            }

            // Đóng modal và reset form
            setModal(false);
            resetForm();
        } catch (error) {
            // Xử lý lỗi
            console.error("Error:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                toast.error(error.response.data.message);
            } else {
                toast.error("Đã có lỗi xảy ra.");
            }
        }
    };

    //Update status
    const lock = async (id) => {
        await axiosInstance.patch(`/vouchers/stopVoucher/${id}`);
        toast.success("Cập nhật thành công");
        fetchData();
    };

    const openlock = async (id) => {
        try {
            const selectedDiscount = discounts.find(discount => discount.id === id);

            if (new Date(selectedDiscount.endDate) >= new Date(selectedDiscount.startDate)) {
                await axiosInstance.patch(`/vouchers/setVoucherRun/${id}`);
                toast.success("Cập nhật thành công");
                fetchData();
            } else {
                toast.error("Không hợp lệ");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                toast.error(error.response.data.message);
            }

        }
    };

    //delete
    const deleteDiscount = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mại này không?")) {
            axiosInstance.delete(`/vouchers/deleteVoucher/${id}`)
                .then(response => {
                    fetchData();
                    toast.success("Xóa thành công");
                })
                .catch(error => {
                    console.error('Lỗi khi xóa dữ liệu:', error);
                });
        }
    };
    const handleDeleteButtonClick = () => {
        if (selectedItems.length > 0) {
            const confirmed = window.confirm("Bạn có chắc chắn muốn xóa các khuyến mại đã chọn không?");

            if (confirmed) {
                const idsToDelete = selectedItems.join(',');

                axiosInstance.delete(`/vouchers/deleteVoucherAll?deleteAll=${idsToDelete}`)
                    .then(response => {
                        fetchData();
                        toast.success("Xóa thành công");
                        setSelectedItems([]);
                        setSelectAll(false);
                    })
                    .catch(error => {
                        console.error('Lỗi khi xóa dữ liệu:', error);
                    });
            }
        }
    };


    return (
        <>

            <div className="col mt-4">

                <Row className="align-items-center my-4">
                    <div className="col d-flex">
                        <Button color="warning" outline size="sm" onClick={handleModal3}>
                            <FaFilter size="16px" className="mr-1" />Bộ lọc
                        </Button>

                        <Col>
                            <InputGroup size="sm">
                                <Input type="search"
                                    placeholder="Tìm kiếm mã, tên voucher..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                                <InputGroupAddon addonType="append">
                                    <InputGroupText>
                                        <FaSearch />
                                    </InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>
                        </Col>
                    </div>

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
                        <Button
                            color="primary" outline
                            onClick={handleModal}
                            size="sm"
                        >
                            + Thêm mới
                        </Button>
                    </div>

                </Row>

                <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light text-center">
                        <tr>
                            <th >
                                <FormGroup check className="pb-4">
                                    <Input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </FormGroup>
                            </th>
                            <th scope="col" style={{ color: "black" }}>STT</th>
                            <th scope="col" style={{ color: "black", position: "sticky", zIndex: '1', left: '0' }}>Trạng thái</th>
                            <th scope="col" style={{ color: "black" }}>
                                Mã
                                <FaSort
                                    style={{ cursor: "pointer" }}
                                    className="text-muted"
                                    onClick={() => handleSort("code")} />
                            </th>
                            <th scope="col" style={{ color: "black" }}>
                                Tên khuyến mại
                                <FaSort
                                    style={{ cursor: "pointer" }}
                                    className="text-muted"
                                    onClick={() => handleSort("name")} />
                            </th>
                            <th scope="col" style={{ color: "black" }}>
                                Hóa đơn <br />tối thiểu
                                <FaSort
                                    style={{ cursor: "pointer" }}
                                    className="text-muted"
                                    onClick={() => handleSort("min_price")} />
                            </th>
                            <th scope="col" style={{ color: "black" }}>Phương thức</th>
                            <th scope="col" style={{ color: "black" }}>Giá trị</th>
                            <th scope="col" style={{ color: "black" }}>
                                Số lượng
                                <FaSort
                                    style={{ cursor: "pointer" }}
                                    className="text-muted"
                                    onClick={() => handleSort("quantity")} />
                            </th>
                            <th scope="col" style={{ color: "black" }}>
                                Ngày bắt đầu
                                <FaSort
                                    style={{ cursor: "pointer" }}
                                    className="text-muted"
                                    onClick={() => handleSort("start_date")} />
                            </th>
                            <th scope="col" style={{ color: "black" }}>
                                Ngày kết thúc
                                <FaSort
                                    style={{ cursor: "pointer" }}
                                    className="text-muted"
                                    onClick={() => handleSort("end_date")} />
                            </th>
                            <th scope="col" style={{ color: "black" }}>Mô tả</th>
                            <th scope="col" style={{ color: "black", position: "sticky", zIndex: '1', right: '0' }}>Thao tác</th>

                        </tr>
                    </thead>
                    <tbody style={{ color: "black" }}>
                        {Array.isArray(discounts) &&
                            discounts
                                .filter(
                                    (discount) =>
                                        discount.code.toLowerCase().includes(searchValue.toLowerCase()) ||
                                        discount.name.toLowerCase().includes(searchValue.toLowerCase())
                                )
                                .filter((discount) => {
                                    if (queryParams.saleMethod) {
                                        if (queryParams.saleMethod === "0" && discount.salePercent) {
                                            return true;
                                        }
                                        if (queryParams.saleMethod === "1" && discount.salePrice) {
                                            return true;
                                        }
                                        return false;
                                    }
                                    return true;
                                })
                                .map((discount, index) => (
                                    <tr key={discount.id}>
                                        <td>
                                            <FormGroup check className="pb-4">
                                                <Input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(discount.id)}
                                                    onChange={() => handleCheckboxChange(discount.id)}
                                                />

                                            </FormGroup>
                                        </td>
                                        <td>{calculateIndex(index)}</td>
                                        <td style={{ position: "sticky", zIndex: '1', left: '0', background: "#fff", textAlign: "center" }}>
                                            <Badge color={statusMapping[discount.status]?.color || statusMapping.default.color}>
                                                {statusMapping[discount.status]?.label || statusMapping.default.label}
                                            </Badge>
                                        </td>
                                        <td>{discount.code}</td>
                                        <td>{discount.name}</td>

                                        <td style={{ textAlign: "right" }}>{formatter.format(discount.minPrice)}</td>
                                        <td style={{ textAlign: "center" }}>
                                            {discount.salePercent ? (
                                                <Badge color="info">Phần trăm</Badge>
                                            ) : discount.salePrice ? (
                                                <Badge color="success">Tiền mặt</Badge>
                                            ) : null}
                                        </td>

                                        <td style={{ textAlign: "right" }}>
                                            {discount.salePercent ? `${discount.salePercent}%` : ""}
                                            {discount.salePrice ? `${formatter.format(discount.salePrice)}` : ""}
                                        </td>
                                        <td style={{ textAlign: "right" }}>{discount.quantity}</td>
                                        <td>{format(new Date(discount.startDate), 'yyyy-MM-dd HH:mm', { locale: vi })}</td>
                                        <td>{format(new Date(discount.endDate), 'yyyy-MM-dd HH:mm', { locale: vi })}</td>
                                        <td>{discount.description}</td>
                                        <td style={{ position: "sticky", zIndex: '1', right: '0', background: "#fff" }}>
                                            {discount.status === 0 &&
                                                <Button color="link" size="sm" ><FaLockOpen onClick={() => lock(discount.id)} /></Button>
                                            }
                                            {(discount.status === 1 || discount.status === 2) &&
                                                <Button color="link" size="sm" ><FaLock onClick={() => openlock(discount.id)} /></Button>
                                            }
                                            <Button color="link" size="sm" onClick={() => handleRowClick(discount)}><FaEdit /></Button>
                                            <Button color="link" size="sm" onClick={() => deleteDiscount(discount.id)}> <FaTrash /></Button>
                                        </td>

                                    </tr>
                                ))}
                    </tbody>
                </Table>
                {/* Hiển thị thanh phân trang */}
                <Row className="mt-4">
                    <Col lg={6}>
                        <div style={{ fontSize: 14 }}>
                            Đang xem <b>{queryParams.page * queryParams.size + 1}</b>  đến <b>{queryParams.page * queryParams.size + discounts.length}</b> trong tổng số <b></b> mục
                        </div>
                    </Col>
                    <Col style={{ fontSize: 14 }} lg={2}>
                        <Row>
                            <span>Xem </span>&nbsp;
                            <span>
                                <Input type="select" name="status" style={{ width: "60px", fontSize: 14 }} size="sm" className="mt--1" onChange={handleSizeChange}>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </Input>
                            </span>&nbsp;
                            <span> mục</span>
                        </Row>
                    </Col>
                    <Col lg={4} style={{ fontSize: 11 }} className="mt--1 text-right">
                        <ReactPaginate
                            breakLabel="..."
                            nextLabel=">"
                            pageRangeDisplayed={2}
                            pageCount={totalPages}
                            previousLabel="<"
                            onPageChange={handlePageChange}
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
            <ToastContainer />

            {/* SaleBills */}
            <Modal
                isOpen={modal}
                toggle={toggle}
                backdrop={'static'}
                keyboard={false}
                style={{ maxWidth: '800px' }}
            >
                <ModalHeader toggle={toggle}>
                    <h3 className="heading-small text-muted mb-0">{formData.id ? 'Cập Nhật Khuyến mại' : 'Thêm Mới Khuyến mại'}</h3>

                </ModalHeader>
                <ModalBody>
                    <Form>
                        <div className="pl-lg-4">
                            <Row>

                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="name"
                                        >
                                            Tên Khuyến mãi
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </FormGroup>
                                </Col>

                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="startDate"
                                        >
                                            Hóa đơn tối thiểu:
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            type="number"
                                            value={formData.minPrice}
                                            onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                                        />
                                    </FormGroup>
                                </Col>

                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="startDate"
                                        >
                                            Ngày bắt đầu
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            id="startDate"
                                            type="datetime-local"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="endDate"
                                        >
                                            Ngày kết thúc
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            id="endDate"
                                            type="datetime-local"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </FormGroup>
                                </Col>


                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-price">
                                            Hình thức
                                        </label>
                                        <div style={{ display: "flex" }}>
                                            <div className="custom-control custom-radio">
                                                <Input
                                                    className="custom-control-alternative"
                                                    name="sale"
                                                    type="radio"
                                                    checked={!formData.sale}
                                                    onChange={() => setFormData({ ...formData, sale: false })}
                                                />Tiền
                                            </div>
                                            <div className="custom-control custom-radio">
                                                <Input
                                                    className="custom-control-alternative"
                                                    name="sale"
                                                    type="radio"
                                                    checked={formData.sale}
                                                    onChange={(e) => setFormData({ ...formData, sale: true })}
                                                />Phần trăm
                                            </div>

                                        </div>
                                    </FormGroup>
                                </Col>

                                {formData.sale && (
                                    <Col lg="6">
                                        <FormGroup>
                                            <label
                                                className="form-control-label"
                                            >
                                                Phần trăm:
                                            </label>
                                            <Input
                                                className="form-control-alternative"
                                                type="number"
                                                value={formData.salePercent}
                                                onChange={(e) => setFormData({ ...formData, salePercent: e.target.value })}
                                            />

                                        </FormGroup>
                                    </Col>
                                )}

                                {!formData.sale && (
                                    <Col lg="6">
                                        <FormGroup>
                                            <label
                                                className="form-control-label"
                                            >
                                                Trị giá (tiền):
                                            </label>
                                            <Input
                                                className="form-control-alternative"
                                                type="number"
                                                value={formData.salePrice}
                                                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>
                                )}


                                <Col lg="6">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="startDate"
                                        >
                                            Số lượng:
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </FormGroup>
                                </Col>

                                <Col className="pl-lg-4">
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="description"
                                        >
                                            Mô tả
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            placeholder="Sản phẩm ....."
                                            rows="4"
                                            type="textarea"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>


                        </div>


                    </Form >
                </ModalBody >
                <ModalFooter>
                    <div className="text-center">
                        <Button color="primary" outline onClick={saveDiscount} size="sm">
                            {formData.id ? "Cập nhật" : "Thêm mới"}
                        </Button>
                        <Button color="primary" outline onClick={resetForm} size="sm">
                            Làm mới
                        </Button>
                        <Button color="danger" outline onClick={toggle} size="sm">
                            Đóng
                        </Button>
                    </div>
                </ModalFooter>

            </Modal >

            {/* Lọc */}
            <Modal
                isOpen={thirdModal}
                toggle={toggleThirdModal}
                style={{ maxWidth: '350px', right: 'unset', left: 0, position: 'fixed', marginLeft: '252px', marginRight: 0, top: "-27px" }}
                backdrop={false}
            >
                <ModalHeader toggle={toggleThirdModal}>
                    <h3 className="heading-small text-muted mb-0">Bộ lọc tìm kiếm</h3>
                </ModalHeader>
                <ModalBody style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <Form >

                        <FormGroup>

                            <Row>
                                <Col xl="6">
                                    <label style={{ fontSize: 13 }}
                                        className="form-control-label"
                                    >
                                        Hóa đơn từ
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        type="number" size="sm" id="minPrice"
                                    />
                                </Col>

                                <Col xl="6">
                                    <label style={{ fontSize: 13 }}
                                        className="form-control-label"
                                    >
                                        đến
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        type="number" size="sm" id="maxPrice"
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <label style={{ fontSize: 13 }}
                                className="form-control-label"
                            >
                                Trạng thái
                            </label>
                            <Input
                                className="form-control-alternative"
                                type="select" size="sm" id="status"
                            >
                                <option value="">Tất cả</option>
                                <option value="0">Đang kích hoạt</option>
                                <option value="1">Chờ kích hoạt</option>
                                <option value="2">Ngừng kích hoạt</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <label style={{ fontSize: 13 }}
                                className="form-control-label"
                            >
                                Phương thức
                            </label>
                            <Input
                                className="form-control-alternative"
                                type="select" size="sm" id="sale"
                            >
                                <option value="">Tất cả</option>
                                <option value="0">Phần trăm</option>
                                <option value="1">Tiền mặt</option>

                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <label style={{ fontSize: 13 }}
                                className="form-control-label"
                            >
                                Ngày bắt đầu
                            </label>
                            <Input
                                className="form-control-alternative"
                                type="date" size="sm" id="fromDate"
                            />
                        </FormGroup>
                        <FormGroup>
                            <label style={{ fontSize: 13 }}
                                className="form-control-label"
                            >
                                Ngày kết thúc
                            </label>
                            <Input
                                className="form-control-alternative"
                                type="date" size="sm" id="toDate"
                            />
                        </FormGroup>

                    </Form>
                </ModalBody>
                <ModalFooter>
                    <div className="row w-100">
                        <div className="col-4">
                            <Button color="primary" outline size="sm" block onClick={() => { resetFilters(); }}>
                                Làm mới
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button color="primary" outline size="sm" block onClick={handleFilter}>
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
        </>
    );
}

export default SaleBills;
