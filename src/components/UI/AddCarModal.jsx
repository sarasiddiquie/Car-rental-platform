import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Corrected import

const AddCarModal = ({ show, onHide, onAddCar, setLoading, setError }) => {
    const [carData, setCarData] = useState({
        name: '',
        brand: '',
        price: '',
        description: '',
        images: [] // Store multiple images
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setCarData({ ...carData, images: [...files] }); // Store multiple files
        } else {
            setCarData({ ...carData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const token = localStorage.getItem('token');
        
        // Check if token exists and is valid before decoding
        if (!token) {
            setError('No token found. Please log in again.');
            setLoading(false);
            return;
        }
    
        try {
            const decodedToken = jwtDecode(token);  // Decode token only if it exists and is valid
            const userId = decodedToken.id;  // Assuming the user ID is in the 'id' field of the token
    
            const formData = new FormData();
            formData.append('name', carData.name);
            formData.append('brand', carData.brand);
            formData.append('price', carData.price);
            formData.append('description', carData.description);
            formData.append('user', userId);  // Pass the userId to the backend
    
            await axios.post('http://localhost:5000/api/cars', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            onAddCar(carData); // Notify parent about the new car
            onHide(); // Close the modal
        } catch (error) {
            console.error('Error creating car:', error);
            setError('Failed to create the car. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add a New Car</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* Form fields for car data */}
                    <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter car name" 
                            name="name" 
                            value={carData.name} 
                            onChange={handleChange} 
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formBrand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter car brand" 
                            name="brand" 
                            value={carData.brand} 
                            onChange={handleChange} 
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control 
                            type="number" 
                            placeholder="Enter car price" 
                            name="price" 
                            value={carData.price} 
                            onChange={handleChange} 
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Enter car description" 
                            name="description" 
                            value={carData.description} 
                            onChange={handleChange} 
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formImages">
                        <Form.Label>Images (max 10)</Form.Label>
                        <Form.Control 
                            type="file" 
                            name="images" 
                            onChange={handleChange} 
                            multiple 
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Add Car
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddCarModal;
