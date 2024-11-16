import React, { useState } from 'react';
import { Card, Button, Spinner, Alert, Modal, Form, Carousel } from 'react-bootstrap';
import axios from 'axios';

const CarCard = ({ car, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showView, setShowView] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({
        name: car.name,
        brand: car.brand,
        price: car.price,
        description: car.description,
        image: null,
    });

    const handleDelete = async () => {
        setLoading(true);
        setError(null); // Reset any previous error
        try {
            await axios.delete(`http://localhost:5000/api/cars/${car._id}`);
            onUpdate(); // Refresh the car list after deletion
        } catch (err) {
            setError('Failed to delete the car. Please try again.');
            console.error('Error deleting car:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', editData.name);
        formData.append('brand', editData.brand);
        formData.append('price', editData.price);
        formData.append('description', editData.description);
        if (editData.image) {
            formData.append('image', editData.image); // Only append if new image is selected
        }

        try {
            await axios.put(`http://localhost:5000/api/cars/${car._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUpdate(); // Refresh the car list after editing
            setShowEdit(false); // Close the edit modal
        } catch (err) {
            setError('Failed to update the car. Please try again.');
            console.error('Error updating car:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleView = () => setShowView(true);
    const handleEdit = () => setShowEdit(true);

    return (
        <>
            <Card style={{ width: '18rem', margin: '1rem' }}>
                <Carousel>
                    {car.images && car.images.map((image, index) => (
                        <Carousel.Item key={index}>
                            <img 
                                className="d-block w-100" 
                                src={`http://localhost:5000/api/cars/image/${image}`} 
                                alt={`${car.name} - ${index + 1}`} 
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
                <Card.Body>
                    <Card.Title>{car.name}</Card.Title>
                    <Card.Text>
                        Brand: {car.brand}<br />
                        Price: ${car.price}<br />
                        Description: {car.description}
                    </Card.Text>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="primary" onClick={handleView}>View</Button>
                        <Button variant="warning" onClick={handleEdit}>Edit</Button>
                        <Button variant="danger" onClick={handleDelete} disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Delete'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* View Modal */}
            <Modal show={showView} onHide={() => setShowView(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Car Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Carousel>
                                {car.images && car.images.map((image, index) => (
                                    <Carousel.Item key={index}>
                                        <img
                                            className="d-block w-100"
                                            src={`http://localhost:5000/api/cars/image/${image}`}
                                            alt={`${car.name} - ${index + 1}`}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h5>Name: {car.name}</h5>
                            <h5>Brand: {car.brand}</h5>
                            <h5>Price: ${car.price}</h5>
                            <p>{car.description}</p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowView(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Car</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter car name"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formBrand">
                            <Form.Label>Brand</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter car brand"
                                value={editData.brand}
                                onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter car price"
                                value={editData.price}
                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter car description"
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formImage">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setEditData({ ...editData, image: e.target.files[0] })}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default CarCard;
