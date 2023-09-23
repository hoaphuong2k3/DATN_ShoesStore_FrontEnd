import React, { useState, useEffect } from 'react';
import { Card, Button, CardHeader, CardBody, Container, Row, Form, Col, Input, Table } from "reactstrap";
import { Dropdown, DropdownButton } from 'react-bootstrap';

// core components
import Header from "components/Headers/BillHeader.js";



const Bills = () => {
  const [orders, setorders] = useState([]);

  useEffect(() => {
    // fetch("https://datnshoes-default-rtdb.firebaseio.com/order.json")
    // .then((response) => response.json())
    // .then((data) => {
    //   const ordersArray = Object.values(data);
    //   setorders(ordersArray);
    //   console.log(ordersArray);
    // })
    // .catch((err) => console.error(err));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://datnshoes-default-rtdb.firebaseio.com/order.json');
      const data = await response.json();
      const ordersArray = Object.values(data);
      setorders(ordersArray);
      console.log(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Danh sách đơn hàng</h3>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col xl="4" >
                      <Input className='mb-3' type="text" placeholder="Nhập từ khóa tìm kiếm..." />
                    </Col>
                    <Col xl="2" >
                      <DropdownButton title="Ngày tạo">
                        <div className="d-flex align-items-center m-2">
                          <Dropdown.Item className='card m-2'>Hôm nay</Dropdown.Item>
                          <Dropdown.Item className='card m-2'>Hôm qua</Dropdown.Item>
                        </div>
                        <div className="d-flex align-items-center m-2">
                          <Dropdown.Item className='card m-2'>Tuần trước</Dropdown.Item>
                          <Dropdown.Item className='card m-2'>Tuần này</Dropdown.Item>
                        </div>
                        <div className="d-flex align-items-center m-2">
                          <Dropdown.Item className='card m-2'>Tháng trước</Dropdown.Item>
                          <Dropdown.Item className='card m-2'>Tháng này</Dropdown.Item>
                        </div>
                        <div className="m-2 card">
                          <Button size="sm">Tùy chọn</Button>
                        </div>
                        <div className="m-2 card">
                          <Button size="sm">Lọc</Button>
                        </div>
                      </DropdownButton>
                    </Col>
                    <Col xl="2" >
                    <DropdownButton title="Trạng thái">
                        <div className="d-flex align-items-center m-2">
                          <Dropdown.Item className='card m-2'>Đặt hàng</Dropdown.Item>
                          <Dropdown.Item className='card m-2'>Đã hủy</Dropdown.Item>
                        </div>
                        <div className="d-flex align-items-center m-2">
                          <Dropdown.Item className='card m-2 text-center'>Hoàn thành</Dropdown.Item>
                        </div>
                        <div className="m-2 card">
                          <Button size="sm">Lọc</Button>
                        </div>
                      </DropdownButton>
                    </Col>
                  </Row>

                  <Table>
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày thanh toán</th>
                        <th>Tên khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Phương thức thanh toán</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.code}</td>
                          <td>{order.date_payment}</td>
                          <td>{order.ten_khach_hang}</td>
                          <td>{order.total_money}</td>
                          <td>{order.payment_methods == 0 ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                          <td>{order.status === 0 ? 'Chưa thanh toán' : 'Đã thanh toán'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Form>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Bills;
