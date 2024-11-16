import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CarCard from '../components/UI/CarCard';
import AddCarModal from '../components/UI/AddCarModal';
import { Button, Container, Row, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);  // Fix typo here and initialize loading state
    const navigate = useNavigate();

    // Check if user is logged in (token exists)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchCars(); // Fetch cars only if user is logged in
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleHideModal = () => {
        setShowModal(false);
    };

    // Fetch cars related to the logged-in user
    const fetchCars = async () => {
        setLoading(true);  // Set loading to true before fetching cars
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/cars', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCars(response.data);
        } catch (error) {
            setErrorMessage('Error fetching cars. Please try again later.');
            console.error(error);
        } finally {
            setLoading(false);  // Set loading to false once the data is fetched or error occurs
        }
    };

    const handleAddCar = (newCar) => {
        setCars([...cars, newCar]);
        setShowModal(false);
    };

    const handleLoginRedirect = () => {
        navigate('/login'); // Redirect to login page if not logged in
    };

    return (
        <Container>
            {!isLoggedIn ? (
                <Alert variant="info">
                    Please <Button variant="link" onClick={handleLoginRedirect}>log in</Button> to access the cars.
                </Alert>
            ) : (
                <>
                    <Button 
                        onClick={() => setShowModal(true)} 
                        className="mb-3"
                    >
                        Add a Car
                    </Button>
                    {loading ? (
                        <Spinner animation="border" role="status" />
                    ) : (
                        <Row>
                            {cars.map(car => (
                                <CarCard key={car._id} car={car} onUpdate={fetchCars} />
                            ))}
                        </Row>
                    )}
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    <AddCarModal 
                        show={showModal} 
                        onHide={handleHideModal} 
                        onAddCar={handleAddCar} 
                        setLoading={setLoading}  // Passing setLoading to AddCarModal
                        setError={setError}
                    />
                </>
            )}
        </Container>
    );
};

export default CarList;
