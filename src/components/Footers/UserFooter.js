import { Row, Col, Nav, NavItem, NavLink, Container } from "reactstrap";

const Footer = () => {
    return (
        <>
        <Container>
            <footer className="footer">
                <Row className="align-items-center justify-content-xl-between">
                    <Col xl="6">
                        <div className="copyright text-center text-xl-left text-muted">
                            © {new Date().getFullYear()}{" "}
                            <a
                                className="font-weight-bold ml-1"
                                href="https://www.creative-tim.com?ref=adr-admin-footer"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Shoes Store
                            </a>
                        </div>
                    </Col>

                    <Col xl="6">
                        <Nav className="nav-footer justify-content-center justify-content-xl-end">
                            <NavItem>
                                <NavLink
                                    href="#"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Superman
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink
                                    href="#"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    About Us
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink
                                    href="#"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Help
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink
                                    href="#"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Contact
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
            </footer>
        </Container>
        </>
    );
};

export default Footer;