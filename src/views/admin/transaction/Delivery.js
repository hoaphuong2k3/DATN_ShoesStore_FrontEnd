import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaFileAlt, FaFilter } from 'react-icons/fa';
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "services/custommize-axios";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
// reactstrap components
import Switch from 'react-input-switch';
import {
    Card, CardHeader, CardBody, Container, Row, Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText,
    Button, Table, Modal, ModalBody, ModalFooter, ModalHeader, Label
} from "reactstrap";


const Delivery = () => {

    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const handleModal = () => {
        resetForm();
        setModal(true);
    }

    const [secondModal, setSecondModal] = useState(false);
    const toggleSecondModal = () => setSecondModal(!secondModal);
    const handleModal2 = () => {
        setSecondModal(true);
    }

    const [value, setValue] = useState('no');
    const [delivery, setDelivery] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);


    const [queryParams, setQueryParams] = useState({
        page: 0,
        size: 1,
        status: "",
    });


    //loads table
    const fetchData = async () => {
        try {
            const response = await axiosInstance.get("/delivery", {
                params: queryParams
            });
            setDelivery(response.content);
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

    const statusOptions = [
        { value: '0', label: 'Chờ vận chuyển' },
        { value: '1', label: 'Đang vận chuyển' },
        { value: '2', label: 'Giao thành công' },
        { value: '-1', label: 'Đã hủy' }
    ];
    const handleStatusChange = (event, deliveryId) => {
        const selectedStatus = event.target.value;
        axiosInstance
            .put(`/delivery/update-status/${deliveryId}/${selectedStatus}`)
            .then(response => {
                toast.success("Cập nhật trạng thái thành công");
                fetchData();
            })
            .catch(error => {
                console.error('Lỗi khi cập nhật trạng thái:', error);
                toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
            });
    };

    //lọc
    const resetFilters = () => {
        setQueryParams({
            page: 0,
            size: 5,
            status: "",
            code: "",
        });
    };

    //click on selected
    const [formData, setFormData] = useState({
        id: null,
        recipientName: "",
        recipientPhone: "",
        deliveryAddress: "",
        deliveryCost: "",
        status: "",
        codeDelivery: "",
    });


    const handleRowClick = async (id) => {
        try {
            const response = await axiosInstance.get(`/delivery/detail/${id}`);
            setFormData(response.data);
            setModal(true);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };


    //reset
    const resetForm = () => {
        setFormData({
            recipientName: "",
            recipientPhone: "",
            deliveryCost: "",
            deliveryAddress: "",
            status: "",
        });
    };

    //save
    const saveDiscount = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axiosInstance.put(`/delivery/update/${formData.id}`, formData);
                toast.success("Cập nhật thành công!");
            } else {
                await axiosInstance.post("/delivery/create", formData);
                toast.success("Thêm mới thành công!");
            }
            fetchData();
            setModal(false);
            resetForm();
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                toast.error(error.response.data.message);
            } else {
                toast.error("Đã có lỗi xảy ra.");
            }
        }
    };


    //delete
    const deletel = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
            axiosInstance.patch(`/delivery/delete/${id}`)
                .then(response => {
                    fetchData();
                    toast.success("Xóa thành công");
                })
                .catch(error => {
                    console.error('Lỗi khi xóa dữ liệu:', error);
                });
        }
    };


    return (
        <>
            <Container className="pt-5 pt-md-7" fluid>
                <Row>
                    <Col>
                        {/* Tabs with icons */}
                        <div className="col">
                            <Card className="shadow">
                                <CardHeader className="bg-transparent">

                                    <Row className="align-items-center">
                                        <div className="col">
                                            <h3 className="heading-small text-muted mb-0">Phiếu giao hàng</h3>
                                        </div>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <div className="col">

                                        <Row className="align-items-center mb-3">
                                            <div className="col" style={{ display: "flex" }}>
                                                <Col lg="3" className="text-left">
                                                    <Button color="warning" outline size="sm" onClick={handleModal2}>
                                                        <FaFilter size="16px" className="mr-1" />Bộ lọc
                                                    </Button>
                                                </Col>

                                                <Col lg="9">
                                                    <InputGroup size="sm">
                                                        <Input type="search" placeholder="Tìm kiếm mã, tên hóa đơn..." />
                                                        <InputGroupAddon addonType="append">
                                                            <InputGroupText>
                                                                <FaSearch />
                                                            </InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </Col>
                                            </div>
                                            <div className="col text-right">
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
                                            <thead className="thead-light">
                                                <tr>
                                                    <th scope="col">STT</th>
                                                    <th scope="col">Trạng thái</th>
                                                    <th scope="col">Mã phiếu giao</th>
                                                    <th scope="col">Tên người nhận</th>
                                                    <th scope="col">Số điện thoại</th>
                                                    <th scope="col">Địa chỉ</th>
                                                    <th scope="col">Giá vận chuyển</th>
                                                    <th scope="col">Ngày vận chuyển</th>
                                                    <th scope="col">Ngày nhận</th>
                                                    <th scope="col">Ngày tạo</th>
                                                    <th scope="col">Ngày cập nhật</th>
                                                    <th scope="col">Ngày hủy</th>

                                                    <th scope="col">Thao tác</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(delivery) &&
                                                    delivery.map((delivery, index) => (
                                                        <tr key={delivery.id}>
                                                            <td>{calculateIndex(index)}</td>
                                                            <td>
                                                                <select
                                                                    value={delivery.status.toString()}
                                                                    onChange={(event) => handleStatusChange(event, delivery.id)}
                                                                    disabled={delivery.status === -1}
                                                                >
                                                                    {statusOptions.map(option => (
                                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                                    ))}
                                                                </select>
                                                            </td>

                                                            <td>{delivery.codeDelivery}</td>
                                                            <td>{delivery.recipientName}</td>
                                                            <td>{delivery.recipientPhone}</td>
                                                            <td>{delivery.deliveryAddress}</td>
                                                            <td>{delivery.deliveryCost} VNĐ</td>
                                                            <td>{delivery.shipDate}</td>
                                                            <td>{delivery.receivedDate}</td>
                                                            <td>{format(new Date(delivery.createdTime), 'yyyy-MM-dd HH:mm', { locale: vi })}</td>
                                                            <td>{format(new Date(delivery.updatedTime), 'yyyy-MM-dd HH:mm', { locale: vi })}</td>
                                                            <td>{delivery.cancellationDate}</td>
                                                            <td>
                                                                <Button color="info" size="sm" onClick={() => handleRowClick(delivery.id)} disabled={delivery.status === -1}><FaEdit /></Button>
                                                                <Button color="danger" size="sm" onClick={() => deletel(delivery.id)}><FaTrash /></Button>
                                                            </td>

                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </Table>
                                        {/* Hiển thị thanh phân trang */}
                                        <Row className="mt-4">
                                            <Col lg={6}>
                                                <div style={{ fontSize: 14 }}>
                                                    Đang xem <b>{queryParams.page * queryParams.size + 1}</b>  đến <b>{queryParams.page * queryParams.size + delivery.length}</b> trong tổng số <b></b> mục
                                                </div>
                                            </Col>
                                            <Col style={{ fontSize: 14 }} lg={2}>
                                                <Row>
                                                    <span>Xem </span>&nbsp;
                                                    <span>
                                                        <Input type="select" name="status" style={{ width: "60px", fontSize: 14 }} size="sm" className="mt--1" onChange={handleSizeChange}>
                                                            <option value="5">5</option>
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
                                    <Modal
                                        isOpen={modal}
                                        toggle={toggle}
                                        backdrop={'static'}
                                        keyboard={false}
                                        style={{ maxWidth: '700px' }}
                                    >
                                        <ModalHeader toggle={toggle}>
                                            <h3 className="heading-small text-muted mb-0">{formData.id ? 'Cập Nhật Phiếu giao' : 'Thêm Mới Phiếu giao'}</h3>
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
                                                                    Tên người nhận
                                                                </label>
                                                                <Input
                                                                    className="form-control-alternative"
                                                                    id="name"
                                                                    type="text"
                                                                    value={formData.recipientName}
                                                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                                                />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col lg="6">
                                                            <FormGroup>
                                                                <label
                                                                    className="form-control-label"
                                                                >
                                                                    Số điện thoại:
                                                                </label>
                                                                <Input
                                                                    className="form-control-alternative"
                                                                    type="text"
                                                                    value={formData.recipientPhone}
                                                                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                                                                />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col lg="6">
                                                            <FormGroup>
                                                                <label
                                                                    className="form-control-label"
                                                                    htmlFor="startDate"
                                                                >
                                                                    Địa chỉ nhận:
                                                                </label>
                                                                <Input
                                                                    className="form-control-alternative"
                                                                    type="text"
                                                                    value={formData.deliveryAddress}
                                                                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col lg="6">
                                                            <FormGroup>
                                                                <label
                                                                    className="form-control-label"
                                                                    htmlFor="endDate"
                                                                >
                                                                    Giá vận chuyển:
                                                                </label>
                                                                <Input
                                                                    className="form-control-alternative"
                                                                    type="number"
                                                                    value={formData.deliveryCost}
                                                                    onChange={(e) => setFormData({ ...formData, deliveryCost: e.target.value })}
                                                                />
                                                            </FormGroup>
                                                        </Col>



                                                    </Row>

                                                </div>


                                            </Form >
                                        </ModalBody >
                                        <ModalFooter>
                                            <div className="text-center">
                                                <Button color="primary" onClick={saveDiscount} size="sm">
                                                    {formData.id ? "Cập nhật" : "Thêm mới"}
                                                </Button>
                                                <Button color="primary" onClick={resetForm} size="sm">
                                                    Reset
                                                </Button>
                                                <Button color="danger" onClick={toggle} size="sm">
                                                    Close
                                                </Button>
                                            </div>
                                        </ModalFooter>

                                    </Modal >


                                    <Modal
                                        isOpen={secondModal}
                                        toggle={toggleSecondModal}
                                        style={{ maxWidth: '350px', right: 'unset', left: 0, position: 'fixed', marginLeft: '252px', marginRight: 0, top: "-27px" }}
                                        backdrop={false}
                                    >
                                        <ModalHeader toggle={toggleSecondModal}>
                                            <h3 className="heading-small text-muted mb-0">Bộ lọc tìm kiếm</h3>
                                        </ModalHeader>
                                        <ModalBody style={{ paddingTop: 0, paddingBottom: 0 }}>
                                            <Form >
                                                <FormGroup>
                                                    <label style={{ fontSize: 13 }}
                                                        className="form-control-label"
                                                    >
                                                        Loại khuyến mại
                                                    </label>
                                                    <Input
                                                        className="form-control-alternative"
                                                        type="select" size="sm"
                                                    >
                                                        <option value="">Tất cả</option>
                                                        <option value="0">Order</option>
                                                        <option value="1">FreeShip</option>
                                                    </Input>
                                                </FormGroup>
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
                                                                type="number" size="sm"
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
                                                                type="number" size="sm"
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
                                                        type="select" size="sm"
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
                                                        Ngày bắt đầu
                                                    </label>
                                                    <Input
                                                        className="form-control-alternative"
                                                        type="date" size="sm"
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
                                                        type="date" size="sm"
                                                    />
                                                </FormGroup>
                                                <FormGroup check>
                                                    <label
                                                        style={{ fontSize: 13, fontWeight: "bold" }}>
                                                        <Input type="checkbox" id="checkbox2" />
                                                        Có quà tặng không?
                                                    </label>
                                                </FormGroup>
                                            </Form>
                                        </ModalBody>
                                        <ModalFooter>
                                            <div className="row w-100">
                                                <div className="col-4">
                                                    <Button color="primary" outline size="sm" block>
                                                        Làm mới
                                                    </Button>
                                                </div>
                                                <div className="col-4">
                                                    <Button color="primary" outline size="sm" block>
                                                        Lọc
                                                    </Button>
                                                </div>
                                                <div className="col-4">
                                                    <Button color="danger" outline size="sm" block onClick={toggleSecondModal}>
                                                        Đóng
                                                    </Button>
                                                </div>
                                            </div>
                                        </ModalFooter>

                                    </Modal>
                                </CardBody>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Delivery;
