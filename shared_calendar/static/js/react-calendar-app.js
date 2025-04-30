// React calendar app will be implemented here
const Timeline = () => {
    const hours = Array.from({length: 18}, (_, i) => i + 6); // 6 AM to 11 PM
    const timeSlotHeight = 90; // pixels per hour slot (increased from 60)
    const [showModal, setShowModal] = React.useState(false);
    const [formData, setFormData] = React.useState({
        title: '',
        date: new Date().toISOString().split('T')[0], // Set default to today
        start_time: '',
        end_time: '',
        can_watch_evee: false
    });
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        // Validate times
        if (formData.start_time && formData.end_time) {
            const start = new Date(`2000-01-01T${formData.start_time}`);
            const end = new Date(`2000-01-01T${formData.end_time}`);
            if (end <= start) {
                newErrors.end_time = 'End time must be after start time';
            }
        }

        // Validate required fields
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.start_time) newErrors.start_time = 'Start time is required';
        if (!formData.end_time) newErrors.end_time = 'End time is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        setIsSubmitting(true);
        console.log('Submitting form data:', formData);
        
        try {
            // Get CSRF token from the hidden input
            const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
            console.log('CSRF Token:', csrfToken);

            // Ensure all required fields are present and properly formatted
            const submissionData = {
                title: formData.title,
                date: formData.date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                can_watch_evee: formData.can_watch_evee
            };

            console.log('Prepared submission data:', submissionData);

            const response = await fetch('/api/appointments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                credentials: 'same-origin',
                body: JSON.stringify(submissionData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                // Reset form and close modal on success
                setFormData({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    start_time: '',
                    end_time: '',
                    can_watch_evee: false
                });
                setShowModal(false);
                // TODO: Add success notification
            } else {
                setErrors({ submit: data.message || 'Failed to create appointment' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ submit: 'Network error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            margin: '0',
            padding: '0',
            fontFamily: 'Arial, sans-serif',
            position: 'fixed',
            left: '0',
            top: '0',
            overflowX: 'hidden',
            overflowY: 'auto',
            touchAction: 'pan-y pinch-zoom'
        }}>
            <div style={{
                width: '100%',
                minHeight: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                boxSizing: 'border-box'
            }}>
                {hours.map(hour => {
                    const time = hour < 12 
                        ? `${hour} AM` 
                        : hour === 12 
                            ? '12 PM' 
                            : `${hour - 12} PM`;
                    
                    return (
                        <div key={hour} style={{
                            height: `${timeSlotHeight}px`,
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            backgroundColor: hour % 2 === 0 ? '#f8f9fa' : '#ffffff',
                            position: 'relative',
                            boxSizing: 'border-box'
                        }}>
                            {/* Half-hour marker */}
                            <div style={{
                                position: 'absolute',
                                left: '80px',
                                right: '0',
                                top: '50%',
                                borderTop: '1px solid rgba(0,0,0,0.1)',
                                zIndex: 1
                            }} />
                            
                            <div style={{
                                width: '80px',
                                minWidth: '80px',
                                padding: '10px',
                                textAlign: 'right',
                                borderRight: '1px solid #e0e0e0',
                                backgroundColor: '#f1f3f5',
                                fontWeight: 'bold',
                                color: '#495057',
                                zIndex: 2,
                                boxSizing: 'border-box',
                                position: 'sticky',
                                left: 0
                            }}>
                                {time}
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '10px',
                                position: 'relative',
                                zIndex: 2,
                                boxSizing: 'border-box'
                            }}>
                                {/* Event space */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setShowModal(true)}
                style={{
                    position: 'fixed',
                    right: '20px',
                    bottom: '20px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                +
            </button>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Create New Appointment</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: errors.title ? '1px solid #dc3545' : '1px solid #ddd'
                                    }}
                                    required
                                />
                                {errors.title && (
                                    <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '5px' }}>
                                        {errors.title}
                                    </div>
                                )}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: errors.date ? '1px solid #dc3545' : '1px solid #ddd'
                                    }}
                                    required
                                />
                                {errors.date && (
                                    <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '5px' }}>
                                        {errors.date}
                                    </div>
                                )}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: errors.start_time ? '1px solid #dc3545' : '1px solid #ddd'
                                    }}
                                    required
                                />
                                {errors.start_time && (
                                    <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '5px' }}>
                                        {errors.start_time}
                                    </div>
                                )}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: errors.end_time ? '1px solid #dc3545' : '1px solid #ddd'
                                    }}
                                    required
                                />
                                {errors.end_time && (
                                    <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '5px' }}>
                                        {errors.end_time}
                                    </div>
                                )}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="can_watch_evee"
                                        checked={formData.can_watch_evee}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    Can Watch Evee
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        backgroundColor: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the component
ReactDOM.render(
    <Timeline />,
    document.getElementById('calendar-root')
);
