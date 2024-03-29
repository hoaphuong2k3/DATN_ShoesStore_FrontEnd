import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "services/custommize-axios";
import { toast } from "react-toastify";
import * as yup from 'yup';
import { FaQrcode, FaUserPlus, FaUndoAlt, FaTrashAlt } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import Toggle from 'react-toggle';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-reader';
import {
    Row, Col, Button, Card, CardBody, CardHeader, Table, InputGroup, Input, ButtonGroup,
    Form, FormGroup, Label, Modal, ModalBody, ModalHeader, ModalFooter, FormFeedback
} from "reactstrap";
import { Empty } from 'antd';
import SlideShow from '../product/SlideShow.js';
import Product from "views/admin/sells/ListProducts.js";

const Order = () => {

    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    const [modal2, setModal2] = useState(false);
    const toggle2 = () => setModal2(!modal2);

    const [modal3, setModal3] = useState(false);
    const toggle3 = () => {
        setResult("");
        setModal3(!modal3)
    };

    const [showQRCode, setShowQRCode] = useState(false);
    const toggleQR = () => setShowQRCode(!showQRCode);

    //phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    //Client+Promotion
    const [promo, setPromo] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [reloadInterval, setReloadInterval] = useState(null);

    const [client, setClient] = useState({
        id: null,
        fullname: "",
        phonenumber: "",
        email: "",
        username: "",
    });

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get('/client/admin');
            setClients(response.content);
        } catch (error) {
            console.error('Lỗi khi tải lại dữ liệu khách hàng:', error);
        }
    };

    const fetchDiscount = async () => {
        try {
            const res = await axiosInstance.get('/store/find-discount_period');
            setPromo(res.data);
            console.log(res.data);
        } catch (error) {
            console.error('Lỗi khi tải lại dữ liệu khách hàng:', error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchDiscount();
        const intervalId = setInterval(() => {
            fetchClients();
        }, 1000);
        setReloadInterval(intervalId);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    //search Client
    const handleSearch = () => {
        const filteredClients = clients.filter((client) =>
            (client.fullname && client.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.phoneNumber && client.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(filteredClients);
    };
    useEffect(() => {
        handleSearch();
    }, [searchTerm]);

    //Add client
    const onAddClient = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/client/admin/create', client);
            resetClient();
            toggle2();
            fetchClients();
            toast.success("Thêm khách hàng thành công");
        } catch (error) {
            let errorMessage = "Lỗi từ máy chủ";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };
    const onInputChange = (e) => {
        setClient({ ...client, [e.target.name]: e.target.value });
    };
    const resetClient = () => {
        setClient({
            fullname: "",
            phonenumber: "",
            email: "",
            username: "",
        });
    };

    //Ship
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [shippingTotal, setShippingTotal] = useState(0);
    const [selectedToDistrictID, setSelectedToDistrictID] = useState("");
    const [selectedToWardCode, setSelectedToWardCode] = useState("");
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [detailedAddress, setDetailedAddress] = useState('');

    const fetchDataFromAPI = async (url, stateSetter) => {
        try {
            const response = await axios.get(url, {
                headers: {
                    'token': '44022259-5cfb-11ee-96dc-de6f804954c9'
                }
            });
            stateSetter(response.data.data);
        } catch (error) {
            console.error(`Lỗi khi lấy dữ liệu từ ${url}:`, error);
        }
    };

    const fetchData = async () => {

        fetchDataFromAPI('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', setProvinces);

        // Nếu có tỉnh/thành được chọn, thì mới fetch quận/huyện
        if (selectedProvince) {
            const districtURL = `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${selectedProvince}`;
            fetchDataFromAPI(districtURL, setDistricts);
        }
        // Nếu có quận/huyện được chọn, thì mới fetch phường/xã
        if (selectedDistrict) {
            const wardURL = `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${selectedDistrict}`;
            fetchDataFromAPI(wardURL, setWards);
        } else {
            // Nếu chưa chọn hết xã/phường, đặt shippingTotal về 0
            setShippingTotal(0);
        }

    };

    useEffect(() => {
        fetchData();
    }, [selectedProvince, selectedDistrict]);

    const resetShip = () => {
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setShippingTotal(0);
        setRecipientName("");
        setRecipientPhone("");
        setDetailedAddress("");
        setValidationErrors({});

    };

    const handleApiCall = async () => {

        const servicesUrl = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services';
        const servicesPayload = {
            shop_id: '4580194',
            from_district: 3440,
            to_district: selectedToDistrictID,
        };

        try {
            const servicesResponse = await axios.get(servicesUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'token': '44022259-5cfb-11ee-96dc-de6f804954c9'
                },
                params: servicesPayload,
            });

            const servicesData = servicesResponse.data;
            console.log(servicesData);

            const selectedService = servicesData.data.find(service => service.service_type_id === 2);

            if (selectedService) {
                const serviceId = selectedService.service_id;
                console.log(serviceId);
                const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
                    headers: {
                        'token': '44022259-5cfb-11ee-96dc-de6f804954c9',
                        'shop_id': '4580194',
                        'Content-Type': 'application/json'
                    },
                    params: {
                        service_id: serviceId,
                        insurance_value: 500000,
                        coupon: null,
                        from_district_id: 3440,
                        to_district_id: selectedToDistrictID,
                        to_ward_code: selectedToWardCode,
                        height: 15,
                        length: 15,
                        weight: 2000,
                        width: 15
                    }
                });
                setShippingTotal(response.data.data.total);
            }
        } catch (error) {
            console.error('Lỗi trong quá trình gọi API:', error);
        }
    };

    useEffect(() => {
        if (showShippingForm && selectedClient) {
            setRecipientName(selectedClient.fullname);
            setRecipientPhone(selectedClient.phoneNumber);
        } else {
            setRecipientName('');
            setRecipientPhone('');
        }
    }, [showShippingForm, selectedClient]);

    //Product
    const [result, setResult] = useState("");
    const [shoesDetail, setShoesDetail] = useState(null);
    let handleScan = async data => {
        if (data) {
            setResult(data);
            setModal3(false);
            try {

                const response = await axiosInstance.get(`/user/shoesdetail/find-one/qr/${data}.png`);
                const shoesDetailData = response.data;

                const existingItemIndex = selectedProducts.findIndex(
                    (existingItem) => existingItem.shoesDetailId === shoesDetailData.detailResponse.id
                );

                if (existingItemIndex !== -1) {
                    const updatedProducts = [...selectedProducts];
                    updatedProducts[existingItemIndex].quantity += 1;
                    setSelectedProducts(updatedProducts);
                } else {
                    const newProduct = {
                        shoesDetailId: shoesDetailData.detailResponse.id,
                        shoesName: shoesDetailData.detailResponse.name,
                        sizeName: shoesDetailData.detailResponse.size,
                        colorName: shoesDetailData.detailResponse.color,
                        discountPrice: shoesDetailData.detailResponse.discountPrice,
                        price: shoesDetailData.detailResponse.price,
                        quantity: 1,
                        image: shoesDetailData.images
                    };

                    setSelectedProducts([...selectedProducts, newProduct]);
                }
                setShoesDetail(shoesDetailData);
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết giày dép:', error);
            }
        }
    };
    let handleError = err => {
    };

    const [selectedProducts, setSelectedProducts] = useState([]);
    const handleSelectProducts = (selectedProductList) => {

        const existingItemIndex = selectedProducts.findIndex((existingItem) => existingItem.shoesDetailId === selectedProductList.shoesDetailId);

        if (existingItemIndex !== -1) {
            const updatedOrderItems = [...selectedProducts];
            updatedOrderItems[existingItemIndex].quantity += selectedProductList.quantity;
            setSelectedProducts(updatedOrderItems);
        } else {
            setSelectedProducts([...selectedProducts, selectedProductList]);
        }
    };
    const resetSelectedProducts = () => {
        setSelectedProducts([]);
    };

    const handleQuantityChange = (e, index) => {
        const newQuantity = parseInt(e.target.value, 10) || 0;

        if (newQuantity <= 15) {

            const updatedProducts = [...selectedProducts];
            updatedProducts[index].quantity = newQuantity;

            setSelectedProducts(updatedProducts);

            const newTotalAmount = updatedProducts.reduce((total, detail) => {
                return total + detail.quantity * detail.discountPrice;
            }, 0);
            setTotalAmount(newTotalAmount);
        }
    };

    const handleDeleteRow = (index) => {
        const updatedProducts = [...selectedProducts];

        updatedProducts.splice(index, 1);

        setSelectedProducts(updatedProducts);
    };


    //Order
    const [deliveryData, setDeliveryData] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [usingPoints, setUsingPoints] = useState(false);

    const handleToggleChange = () => {
        setUsingPoints(!usingPoints);
    };
    useEffect(() => {
        const newTotalAmount = selectedProducts.reduce((total, detail) => {
            return total + detail.quantity * detail.discountPrice;
        }, 0);
        setTotalAmount(newTotalAmount);
    }, [selectedProducts]);

    const [isBankTransfer, setIsBankTransfer] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(4);
    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setIsBankTransfer(method === 3 || method === 1);
        if (method === 3) {
            setShowQRCode(true);
        } else {
            setShowQRCode(false);
        }
    };

    const buildDeliveryAddress = () => {
        const addressParts = [];

        if (detailedAddress) {
            addressParts.push(detailedAddress);
        }

        if (selectedWard) {
            addressParts.push(selectedWard);
        }

        if (selectedDistrict) {
            addressParts.push(selectedDistrict);
        }

        if (selectedProvince) {
            addressParts.push(selectedProvince);
        }

        const deliveryAddress = addressParts.join(", ");

        return deliveryAddress;
    };

    const calculateBaseAmount = () => {
        return (
            totalAmount -
            (promo && promo.typePeriod === 0 ? (promo.salePercent / 100) * totalAmount : 0) +
            shippingTotal +
            (promo && promo.typePeriod === 1 ? -shippingTotal : 0)
        );
    };

    const calculateTotalMoney = () => {
        const baseAmount = calculateBaseAmount();

        // Kiểm tra điều kiện và tính toán giá trị mới
        const adjustedAmount = usingPoints === true
            ? (baseAmount >= selectedClient.totalPoints
                ? baseAmount - selectedClient.totalPoints
                : 0)
            : baseAmount;

        return adjustedAmount;
    };

    const usedPoints = () => {
        const baseAmount = calculateBaseAmount();

        if (usingPoints === true) {
            return baseAmount >= selectedClient.totalPoints ? 0 : parseInt(selectedClient.totalPoints - baseAmount);
        } else {
            return null;
        }
    };

    let idDiscountPeriods;
    if (promo) {
        idDiscountPeriods = promo.id;
    } else {
        idDiscountPeriods = null;
    }

    const [validationErrors, setValidationErrors] = useState({});

    const shippingSchema = yup.object().shape({
        recipientName: yup.string().required('Vui lòng nhập tên người nhận.'),
        recipientPhone: yup.string().matches(/^(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ.').required('Vui lòng nhập số điện thoại.'),
        selectedProvince: yup.string().required('Vui lòng chọn tỉnh/thành phố.'),
        selectedDistrict: yup.string().required('Vui lòng chọn quận/huyện.'),
        selectedWard: yup.string().required('Vui lòng chọn xã/phường.'),
        detailedAddress: yup.string().required('Vui lòng nhập địa chỉ chi tiết.')
    });


    const createOrder = async () => {

        try {

            if (selectedProducts.length === 0) {
                toast.error("Chọn sản phẩm để hoàn thành đơn hàng");
            }

            const idClient = selectedClient ? selectedClient.id : null;
            let deliveryOrderDTO = null;

            if (showShippingForm) {

                await shippingSchema.validate({
                    recipientName,
                    recipientPhone,
                    selectedProvince,
                    selectedDistrict,
                    selectedWard,
                    detailedAddress,
                }, { abortEarly: false });

                const newDeliveryAddress = buildDeliveryAddress();
                setDeliveryData({ ...deliveryData, deliveryAddress: newDeliveryAddress });
                deliveryOrderDTO = {
                    address: newDeliveryAddress,
                    recipientName: recipientName,
                    recipientPhone: recipientPhone,
                    deliveryCost: shippingTotal,
                };
            }

            const orderResponse = await axiosInstance.post('/store/create', {
                totalMoney: totalAmount,
                totalPayment: calculateTotalMoney(),
                paymentMethod: paymentMethod,
                idDiscountPeriods: idDiscountPeriods,
                idClient: idClient,
                usingPoints: usingPoints,
                totalPoints: usedPoints(),
                shoesInCart: selectedProducts.map(product => ({
                    quantity: product.quantity,
                    idShoesDetail: product.shoesDetailId
                })),
                deliveryOrderDTO: deliveryOrderDTO,
            });

            const orderId = orderResponse.data.id;

            let coinRefund = 0;
            let accumulatedCoins = 0;
            let nameClient = "Khách lẻ";
            let phoneClient = "";
            let addressDelivery = "";
            let priceDiscountPeriod = 0;
            if (promo && promo.minPrice !== null && totalAmount >= promo.minPrice && promo.typePeriod === 0) {
                priceDiscountPeriod = (promo.salePercent / 100) * totalAmount;
            }

            if (selectedClient !== null) {
                coinRefund = totalAmount >= 10000000 ? totalAmount * 0.02 : totalAmount * 0.01;
                accumulatedCoins = calculateBaseAmount() >= selectedClient.totalPoints
                    ? Math.abs(-selectedClient.totalPoints)
                    : Math.abs(-calculateBaseAmount());
                nameClient = selectedClient.fullname;
                phoneClient = selectedClient.phoneNumber;
                addressDelivery = buildDeliveryAddress();
            }

            // Gọi API in hóa đơn
            const res = await axiosInstance.post(`/order/order-detail/print/${orderId}`,{
                coinRefund,
                accumulatedCoins,
                nameClient,
                phoneClient,
                addressDelivery,
                priceDiscountPeriod,
            }, {
                responseType: 'blob',
            });

            const blob = new Blob([res], { type: 'application/pdf' });

            // Tạo một URL cho Blob và tạo một thẻ a để download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Export_Hóa đơn.pdf';
            document.body.appendChild(a);
            a.click();

            // Giải phóng tài nguyên
            window.URL.revokeObjectURL(url);

            toast.success("Tạo đơn hàng thành công");
            resetSelectedProducts();
            setSelectedClient(null);
            setSearchTerm("");
            setUsingPoints(false);
            resetShip();
            setShowShippingForm(false);
            setPaymentMethod(4);
            setCustomerPayment(0);

        } catch (validationError) {
            const errors = {};
            if (validationError.inner && Array.isArray(validationError.inner)) {
                validationError.inner.forEach(error => {
                    errors[error.path] = error.message;
                });
            }
            setValidationErrors(errors);
        }
    };

    //Tính toán
    const [customerPayment, setCustomerPayment] = useState(0);
    const [changeAmount, setChangeAmount] = useState(0);

    useEffect(() => {
        const remainingAmount = customerPayment - calculateTotalMoney();
        setChangeAmount(remainingAmount < 0 ? 0 : remainingAmount);
    }, [calculateTotalMoney(), customerPayment]);

    const formatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    });

    return (
        <Row className="my-4">
            <Col lg={12} className="text-right">
                <Button color="warning" outline size="sm" onClick={toggle3}>
                    <FaQrcode className="mr-1" />QR Code
                </Button>
                <Button color="primary" outline size="sm" onClick={toggle}>
                    + Danh mục
                </Button>
            </Col>

            <Col lg={12} className="my-3">
                <Card >
                    <CardHeader className=" h4 border-0">Giỏ hàng</CardHeader>
                    <CardBody>
                        {selectedProducts.length === 0 ? (
                            <div className="text-center text-muted">
                                <Empty description={
                                    <span>
                                        Chưa có sản phẩm trong giỏ
                                    </span>
                                } />

                                <Button className="mt-1 text-white" style={{ backgroundColor: "#0099FF" }} size="sm" onClick={toggle}>
                                    <i class="fa-solid fa-right-to-bracket" />&nbsp;
                                    Danh mục
                                </Button>
                            </div>
                        ) : (
                            <Table>

                                <thead className="thead-light text-center">
                                    <tr>
                                        <th scope="col" className="text-dark">STT</th>
                                        <th scope="col" className="text-dark">Ảnh</th>
                                        <th scope="col" className="text-dark">Sản phẩm</th>
                                        <th scope="col" className="text-dark">Giá bán</th>
                                        <th scope="col" className="text-dark">Số lượng</th>
                                        <th scope="col" className="text-dark">Tổng tiền</th>
                                        <th scope="col" className="text-dark">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: 14 }}>
                                    {selectedProducts
                                        .slice(startIndex, endIndex)
                                        .map((detail, index) => (
                                            <tr key={detail.shoesDetailId}>
                                                <th className="text-center">{index + 1}</th>
                                                <td>
                                                    <SlideShow
                                                        images={detail.image}
                                                        imageSize={"80px"}
                                                    />
                                                </td>
                                                <td>
                                                    <h4>{detail.code} - {detail.shoesName}</h4>
                                                    <span className="mr-2">Size: {detail.sizeName}</span>
                                                    <span>Màu: {detail.colorName}</span>
                                                </td>
                                                <td className="text-right">
                                                    {detail.discountPrice !== null && detail.discountPrice !== detail.price ? (
                                                        <>
                                                            <h5>{formatter.format(detail.discountPrice)}</h5>
                                                            <span style={{ textDecoration: 'line-through' }}>{formatter.format(detail.price)}</span>
                                                        </>
                                                    ) : (
                                                        <h5>{formatter.format(detail.discountPrice)}</h5>
                                                    )}
                                                </td>

                                                <td>
                                                    <Input className="text-center m-auto"
                                                        type="number"
                                                        size="sm" min={1} max={15}
                                                        style={{ width: "50px" }}
                                                        value={detail.quantity}
                                                        onChange={(e) => handleQuantityChange(e, index)}
                                                    />
                                                </td>
                                                <td className="text-right" style={{ color: "red" }}>{formatter.format(detail.quantity * detail.discountPrice)}</td>
                                                <td className="text-center" onClick={() => handleDeleteRow(index)}>
                                                    <FaTrashAlt style={{ cursor: "pointer" }} />
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        )}

                        {promo && promo.freeGiftImage && promo.freeGiftName && (
                            <div style={{ padding: "15px 0 5px 0", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", marginTop: 20 }}>
                                <div className="item d-flex">
                                    <div className="product-container mr-5">
                                        <img
                                            src={`data:image/jpeg;base64,${promo.freeGiftImage}`}
                                            alt={promo.freeGiftName}
                                            style={{ width: "50px" }}
                                        />
                                        <div className="quantity-badge">
                                            <span className="quantity">1</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-warning text-center" style={{ border: "1px solid", fontSize: 11, width: 60 }}>Quà tặng</div>
                                        <div className="small mt-1">{promo.freeGiftName}</div>
                                        {/* <div className="mt-1 small text-primary">Chương trình áp dụng: từ ngày {promo.startDate}</div> */}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedProducts.length > 0 && (
                            <Row className="col" style={{ justifyContent: "center" }}>
                                <ReactPaginate
                                    pageCount={Math.ceil(selectedProducts.length / itemsPerPage)}
                                    pageRangeDisplayed={5}
                                    marginPagesDisplayed={2}
                                    previousLabel={'<'}
                                    nextLabel={'>'}
                                    breakLabel={'...'}
                                    onPageChange={handlePageChange}
                                    containerClassName={'pagination'}
                                    activeClassName={'active'}
                                />
                            </Row>
                        )}
                    </CardBody>

                </Card>
            </Col>

            <Row className="col">
                <Col lg={7}>

                    <Col lg="12">
                        <Card style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
                            <CardHeader>
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h4>Khách hàng</h4>
                                    </div>
                                    <div className="col text-right">
                                        <Row>
                                            <InputGroup size="sm" style={{ width: 200 }}>
                                                <Input
                                                    type="text"
                                                    placeholder="Tìm kiếm khách hàng"
                                                    value={selectedClient ? selectedClient.fullname : searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace') {
                                                            setSelectedClient(null);
                                                            setSearchTerm("");
                                                            setUsingPoints(false);
                                                        }
                                                    }}
                                                />
                                            </InputGroup>
                                            <FaUserPlus className="mt-2 ml-3" style={{ cursor: "pointer" }} onClick={toggle2} />
                                        </Row>
                                        <Row>
                                            <Form style={{ position: "absolute", zIndex: 1, background: "#fff" }}>
                                                {searchTerm && searchResults.length > 0 && (
                                                    <ul style={{ listStyle: "none", fontSize: 12, border: "1px solid #ccc", borderRadius: 8, padding: 0, marginTop: 10, boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
                                                        {searchResults.map((result) => (
                                                            <li
                                                                key={result.id}
                                                                onClick={() => {
                                                                    setSelectedClient(result);
                                                                    setSearchTerm("");
                                                                }}
                                                                style={{ padding: 5, borderBottom: "1px solid #ccc", borderRadius: 8, cursor: "pointer" }}
                                                            >
                                                                {result.fullname}- {result.phoneNumber}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </Form>
                                        </Row>
                                    </div>


                                </Row>
                            </CardHeader>
                            {selectedClient && (
                                <CardBody style={{ fontSize: 14, position: "relative", zIndex: 0 }}>
                                    <Form>
                                        <Form>
                                            <Row className="mb-1">
                                                <Label className="col">Tên khách hàng:</Label>
                                                <Col className="text-right">
                                                    <h5>{selectedClient ? selectedClient.fullname : ""}</h5>
                                                </Col>
                                            </Row>
                                            <Row className="mb-1">
                                                <Label className="col">Email:</Label>
                                                <Col className="text-right">
                                                    <h5>{selectedClient ? selectedClient.email : ""}</h5>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Label className="col">Số điện thoại:</Label>
                                                <Col className="text-right">
                                                    <h5>{selectedClient ? selectedClient.phoneNumber : ""}</h5>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Label className="col">Xu tích lũy: </Label>
                                                <Col className="text-right">
                                                    <h5>{selectedClient ? selectedClient.totalPoints : ""}</h5>
                                                </Col>
                                            </Row>
                                            <div className="mt-2 d-flex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {selectedClient.totalPoints !== null && (
                                                    <>
                                                        <small className="mr-1">
                                                            {usingPoints
                                                                ? `Xu còn lại: ${usedPoints()}`
                                                                : `Sử dụng xu`
                                                            }
                                                        </small>

                                                        <Toggle size="sm" defaultChecked={false} onChange={handleToggleChange} />
                                                    </>
                                                )}
                                            </div>
                                        </Form>
                                    </Form>
                                </CardBody>
                            )}
                        </Card>
                    </Col>

                    {showShippingForm && (
                        <Col lg="12" className="mt-3">
                            <Card style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
                                <CardHeader>
                                    <Row className="col" style={{ justifyContent: "space-between" }}>
                                        <h4>Thông tin giao hàng</h4>
                                        <FaUndoAlt outline onClick={resetShip} style={{ cursor: "pointer" }} />

                                    </Row>
                                </CardHeader>
                                <CardBody style={{ fontSize: 14 }}>
                                    <Form>
                                        <Row>
                                            <Col lg="6">
                                                <FormGroup>
                                                    <Label>Người nhận</Label>
                                                    <Input
                                                        type="text"
                                                        size="sm"
                                                        value={recipientName}
                                                        onChange={(e) => setRecipientName(e.target.value)}
                                                        invalid={!!validationErrors.recipientName}
                                                    />
                                                    <FormFeedback>{validationErrors.recipientName}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col lg="6">
                                                <FormGroup>
                                                    <Label>Số điện thoại</Label>
                                                    <Input
                                                        type="tel"
                                                        size="sm"
                                                        value={recipientPhone}
                                                        onChange={(e) => setRecipientPhone(e.target.value)}
                                                        invalid={!!validationErrors.recipientPhone}
                                                    />
                                                    <FormFeedback>{validationErrors.recipientPhone}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Các trường khác tương tự */}

                                        <Row>
                                            <Col lg="4">
                                                <FormGroup>
                                                    <Label>Tỉnh/thành phố</Label>
                                                    <Input
                                                        size="sm"
                                                        type="select"
                                                        style={{ fontSize: 13 }}
                                                        value={selectedProvince}
                                                        onChange={(e) => {
                                                            setSelectedProvince(e.target.value);
                                                            setSelectedDistrict("");
                                                            setSelectedWard("");
                                                        }}
                                                        invalid={!!validationErrors.selectedProvince}
                                                    >
                                                        <option value="">---Chọn---</option>
                                                        {provinces.map((province) => (
                                                            <option key={province.ProvinceID} value={province.ProvinceID}>
                                                                {province.ProvinceName}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                    <FormFeedback>{validationErrors.selectedProvince}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col lg="4">
                                                <FormGroup>
                                                    <Label>Quận/huyện</Label>
                                                    <Input
                                                        size="sm"
                                                        type="select"
                                                        style={{ fontSize: 13 }}
                                                        value={selectedDistrict}
                                                        disabled={!selectedProvince}
                                                        onChange={(e) => {
                                                            setSelectedDistrict(e.target.value);
                                                            setSelectedWard("");
                                                            setSelectedToDistrictID(e.target.value);
                                                        }}
                                                        invalid={!!validationErrors.selectedDistrict}
                                                    >
                                                        <option value="">---Chọn---</option>
                                                        {selectedProvince &&
                                                            districts.map((district) => (
                                                                <option key={district.DistrictID} value={district.DistrictID}>
                                                                    {district.DistrictName}
                                                                </option>
                                                            ))}
                                                    </Input>
                                                    <FormFeedback>{validationErrors.selectedDistrict}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col lg="4">
                                                <FormGroup>
                                                    <Label>Xã/phường</Label>
                                                    <Input
                                                        size="sm"
                                                        type="select"
                                                        style={{ fontSize: 13 }}
                                                        value={selectedWard}
                                                        disabled={!selectedDistrict}
                                                        onChange={(e) => {
                                                            setSelectedWard(e.target.value);
                                                            setSelectedToWardCode(e.target.value.toString());
                                                            handleApiCall();
                                                        }}
                                                        invalid={!!validationErrors.selectedWard}
                                                    >
                                                        <option value="">---Chọn---</option>
                                                        {selectedDistrict &&
                                                            wards.map((ward) => (
                                                                <option key={ward.WardCode} value={ward.WardCode}>
                                                                    {ward.WardName}
                                                                </option>
                                                            ))}
                                                    </Input>
                                                    <FormFeedback>{validationErrors.selectedWard}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col lg="12">
                                                <FormGroup>
                                                    <Label>Địa chỉ</Label>
                                                    <Input
                                                        rows="2"
                                                        type="textarea"
                                                        size="sm"
                                                        value={detailedAddress}
                                                        onChange={(e) => setDetailedAddress(e.target.value)}
                                                        placeholder="Địa chỉ chi tiết..."
                                                        invalid={!!validationErrors.detailedAddress}
                                                    />
                                                    <FormFeedback>{validationErrors.detailedAddress}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Form>
                                </CardBody>

                            </Card>
                        </Col>
                    )}

                </Col>

                <Col lg={5}>

                    <Card style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
                        <CardHeader>
                            <Row className="col" style={{ justifyContent: "space-between" }}>
                                <h4>Thanh toán</h4>
                                <FormGroup check>
                                    <Label >
                                        <Input
                                            type="checkbox"
                                            checked={showShippingForm}
                                            onChange={() => {
                                                setShowShippingForm(!showShippingForm);
                                                if (showShippingForm) {
                                                    resetShip();
                                                }
                                            }}
                                        /><i class="fa-solid fa-truck-fast" />
                                    </Label>
                                </FormGroup>
                            </Row>
                        </CardHeader>
                        <CardBody style={{ fontSize: 14 }}>
                            <Form>
                                <Row className="mb-1">
                                    <Label className="col">Tiền hàng:</Label>
                                    <Col className="text-right">
                                        <h5>{formatter.format(totalAmount)}</h5>
                                    </Col>
                                </Row>
                                {promo && promo.minPrice !== null && totalAmount >= promo.minPrice && promo.typePeriod === 0 && (
                                    <Row className="mb-1">
                                        <Label className="col">Voucher của shop: <small className="text-danger">({promo.salePercent}%)</small></Label>
                                        <Col className="text-right">
                                            <h5>{formatter.format(-(promo.salePercent / 100) * totalAmount)}</h5>
                                        </Col>
                                    </Row>
                                )}
                                {showShippingForm && (
                                    <Row className="mb-1">
                                        <Label className="col">Phí vận chuyển:</Label>
                                        <Col className="text-right">
                                            <h5>{formatter.format(shippingTotal)}</h5>
                                        </Col>
                                    </Row>
                                )}
                                {promo?.minPrice === null && promo?.typePeriod === 1 && showShippingForm && (
                                    <Row className="mb-1">
                                        <Label className="col">Giảm phí vận chuyển:</Label>
                                        <Col className="text-right">
                                            <h5>{formatter.format(-shippingTotal)}</h5>
                                        </Col>
                                    </Row>
                                )}

                                <Row className="mb-1">
                                    {usingPoints === true && (
                                        <>
                                            <Label className="col">Xu tích lũy</Label>
                                            <Col>
                                                <h5 className="text-right">
                                                    {calculateBaseAmount() >= selectedClient.totalPoints
                                                        ? formatter.format(-selectedClient.totalPoints)
                                                        : formatter.format(-calculateBaseAmount())
                                                    }
                                                </h5>
                                            </Col>
                                        </>
                                    )}
                                </Row>


                                <Row className="mb-1">
                                    <Label className="col h5" style={{ fontSize: 14 }}>Thành tiền:</Label>
                                    <Col className="text-right">
                                        <h5 style={{ color: "red" }}>
                                            {formatter.format(calculateTotalMoney())}
                                        </h5>
                                    </Col>
                                </Row>

                                <Row className="mb-1">
                                    <Col lg="12">
                                        <InputGroup size="sm">
                                            <Input
                                                type="text"
                                                value={customerPayment}
                                                onChange={(e) => {
                                                    setCustomerPayment(e.target.value)
                                                }}
                                                style={{ textAlign: 'right' }}
                                                disabled={isBankTransfer}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-1">
                                    <Label className="col">Tiền thừa:</Label>
                                    <Col className="text-right">
                                        <h5 style={{ color: "red" }}>{formatter.format(changeAmount)}</h5>
                                    </Col>
                                </Row>

                                <Row className="mb-1">
                                    <small className="col text-danger text-right">
                                        {selectedClient && (
                                            <>
                                                (Hoàn xu:
                                                {totalAmount >= 10000000
                                                    ? ` ${totalAmount * 0.02}`
                                                    : ` ${totalAmount * 0.01}`
                                                })
                                            </>
                                        )}
                                    </small>
                                </Row>

                                <Row className="mb-1">
                                    <Col xs={6}>
                                        <ButtonGroup className="w-100">
                                            <Button
                                                name="money"
                                                active={paymentMethod === 4}
                                                onClick={() => handlePaymentMethodChange(4)}
                                                style={{
                                                    borderRadius: 0,
                                                    fontWeight: 400,
                                                    backgroundColor: paymentMethod === 4 ? '#0099FF' : '',
                                                    color: paymentMethod === 4 ? '#fff' : ''
                                                }}
                                            >
                                                Tiền mặt
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                    <Col xs={6}>
                                        <ButtonGroup className="float-right w-100">
                                            <Button
                                                name="money"
                                                active={paymentMethod === 3}
                                                onClick={() => handlePaymentMethodChange(3)}
                                                style={{
                                                    borderRadius: 0,
                                                    fontWeight: 400,
                                                    backgroundColor: paymentMethod === 3 ? '#0099FF' : '',
                                                    color: paymentMethod === 3 ? '#fff' : ''
                                                }}
                                            >
                                                Chuyển khoản
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>


                                {showShippingForm && (
                                    <Row>
                                        <Col>
                                            <ButtonGroup className="w-100">
                                                <Button

                                                    name="money"
                                                    active={paymentMethod === 1}
                                                    onClick={() => handlePaymentMethodChange(1)}
                                                    style={{
                                                        borderRadius: 0,
                                                        fontWeight: 400,
                                                        backgroundColor: paymentMethod === 1 ? '#0099FF' : '',
                                                        color: paymentMethod === 1 ? '#fff' : ''
                                                    }}
                                                >
                                                    Thanh toán sau khi nhận hàng
                                                </Button>
                                            </ButtonGroup>
                                        </Col>

                                    </Row>
                                )}

                            </Form>
                        </CardBody>

                    </Card>
                </Col>
            </Row>

            <Col lg={12} className="my-4 text-center">
                <Button className="bg-gradient-info text-white text-uppercase" onClick={createOrder}>Xác nhận đơn</Button>
            </Col>


            {/* ListProduct */}
            <Modal
                isOpen={modal}
                toggle={toggle}
                backdrop={'static'}
                keyboard={false}
                style={{ maxWidth: '1000px' }}
            >
                <ModalHeader toggle={toggle}>
                    <h3 className="heading-small text-dark mb-0">Danh sách sản phẩm</h3>
                </ModalHeader>
                <ModalBody>
                    <Product onSelectProducts={handleSelectProducts} />
                </ModalBody >
                <ModalFooter>
                    <div className="text-center">
                        <Button color="danger" outline onClick={toggle} size="sm">
                            Đóng
                        </Button>
                    </div>
                </ModalFooter>
            </Modal >

            {/* Client */}
            <Modal
                isOpen={modal2}
                toggle={toggle2}
                backdrop={'static'}
                keyboard={false}
                style={{ maxWidth: '550px' }}
            >
                <ModalHeader toggle={toggle2}>
                    <h3 className="heading-small text-dark mb-0">Thêm khách hàng</h3>
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <Row>
                            <Col lg="6">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Họ tên
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        type="text"
                                        name="fullname"
                                        value={client.fullname}
                                        onChange={onInputChange}
                                    />
                                </FormGroup>
                            </Col>

                            <Col lg="6">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Tên đăng nhập
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        type="text"
                                        name="username"
                                        value={client.username}
                                        onChange={onInputChange}
                                    />
                                </FormGroup>
                            </Col>
                            <Col lg="6">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Email
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        type="email"
                                        name="email"
                                        value={client.email}
                                        onChange={onInputChange}
                                    />
                                </FormGroup>
                            </Col>
                            <Col lg="6">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Số điện thoại
                                    </label>
                                    <Input
                                        className="form-control-alternative"
                                        type="tel"
                                        name="phonenumber"
                                        value={client.phonenumber}
                                        onChange={onInputChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody >
                <ModalFooter>
                    <div className="text-center">
                        <Button color="primary" outline size="sm" onClick={onAddClient}>
                            Thêm
                        </Button>
                        <Button color="primary" outline size="sm" onClick={resetClient}>
                            Làm mới
                        </Button>
                        <Button color="danger" outline onClick={toggle2} size="sm">
                            Đóng
                        </Button>
                    </div>
                </ModalFooter>
            </Modal >

            {/*Scan QRCode */}
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

            {/* Mã QRCode */}
            <Modal isOpen={showQRCode} toggle={toggleQR} size="sm">
                <ModalHeader className="pb-0" toggle={toggleQR}>Mã QRCode</ModalHeader>
                <ModalBody className="text-center p-0">

                    <QRCode
                        id='qrcode'
                        value='https://viblo.asia/u/tranchien'
                        size={300}
                        level={'H'}
                        includeMargin={true}
                    />
                    <p>Leather Gents</p>

                </ModalBody>
            </Modal>
        </Row>
    );
};

export default Order;
