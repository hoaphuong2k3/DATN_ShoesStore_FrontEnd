import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import Select from "react-select";
// core components
import ProfileHeader from "components/Headers/ProfileHeader";

const Profile = () => {


  const [provinces, setProvinces] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [admins, setAdmins] = useState([]);

  const fetchData = async () => {
    try {
      const provincesResponse = await axios.get("https://provinces.open-api.vn/api/?depth=3");
      setProvinces(provincesResponse.data);

      const adminsResponse = await axios.get("http://localhost:33321/api/account/{username}");
      setAdmins(adminsResponse.data.content);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <ProfileHeader />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3">
                  <div className="card-profile-image">
                    <a href="#s" onClick={(e) => e.preventDefault()}>
                      <img
                        alt="..."
                        className="rounded-circle"
                        src={require("../../assets/img/theme/team-4-800x800.jpg")}
                      />
                    </a>
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">

              </CardHeader>
              <CardBody className="pt-0 pt-md-4">

                <div className="text-center">
                  <div className="h5 mt-6">
                    <i className="ni business_briefcase-24 mr-2" />
                    hoaphuong, 19/07/2003
                  </div>
                  <div>
                    <i className="ni education_hat mr-2" />
                    Leather Gent
                  </div>
                  <hr className="my-4" />
                  <p>
                    Ryan — the name taken by Melbourne-raised, Brooklyn-based
                    Nick Murphy — writes, performs and records all of his own
                    music.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My account</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      Settings
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                  <h6 className="heading-small text-muted mb-4">
                    User information
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-username"
                          >
                            Họ tên
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="fullname"
                            type="text"

                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-email"
                          >
                            Email
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-email"
                            type="email"

                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-first-name"
                          >
                            Sinh nhật
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="birthday"
                            type="date"

                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-last-name"
                          >
                            Số điện thoại
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="phoneNumber"
                            type="tel"

                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />
                  {/* Address */}
                  <h6 className="heading-small text-muted mb-4">
                    Contact information
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col md="12">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-address"
                          >
                            Địa chỉ
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-address"
                            type="text"

                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="4">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-city"
                          >
                            Thành Phố / Tỉnh
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="select"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                          >
                            <option value="">Chọn Thành Phố/Tỉnh</option>
                            {provinces.map((province) => (
                              <option key={province.code} value={province.name}>
                                {province.name}
                              </option>
                            ))}
                          </Input>


                        </FormGroup>
                      </Col>
                      <Col lg="4">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-country"
                          >
                            Quận/Huyện
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="select"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedCity}
                          >
                            <option value="">Chọn Quận/Huyện</option>
                            {selectedCity &&
                              provinces
                                .find((province) => province.name === selectedCity)
                                .districts.map((district) => (
                                  <option key={district.code} value={district.name}>
                                    {district.name}
                                  </option>
                                ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col lg="4">
                        <FormGroup>
                          <label
                            className="form-control-label" >
                            Phường/Xã
                          </label>
                          <Input
                            className="form-control-alternative"
                            type="select"
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            disabled={!selectedDistrict}
                          >
                            <option value="">Chọn Phường/Xã</option>
                            {selectedDistrict &&
                              provinces
                                .find((province) => province.name === selectedCity)
                                .districts.find((district) => district.name === selectedDistrict)
                                .wards.map((ward) => (
                                  <option key={ward.code} value={ward.name}>
                                    {ward.name}
                                  </option>
                                ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />

                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container >
    </>
  );
};

export default Profile;
