// React calendar app will be implemented here
const Timeline = () => {
    const hours = Array.from({length: 18}, (_, i) => i + 6); // 6 AM to 11 PM
    const timeSlotHeight = 90; // pixels per hour slot (increased from 60)
    const [showModal, setShowModal] = React.useState(false);
    const [editingAppointment, setEditingAppointment] = React.useState(null);
    const rootElement = document.getElementById('calendar-root');
    const currentUsername = rootElement ? rootElement.dataset.username : '';
    console.log('Current username:', currentUsername); // Debug log
    const [formData, setFormData] = React.useState(() => {
        // Get current time and round up to next hour
        const now = new Date();
        const currentHour = now.getHours();
        const nextHour = currentHour + 1;
        
        // Format times as HH:MM
        const formatTime = (hour) => {
            const paddedHour = hour.toString().padStart(2, '0');
            return `${paddedHour}:00`;
        };

        return {
            title: currentUsername || '',
            date: new Date().toISOString().split('T')[0],
            start_time: formatTime(nextHour),
            end_time: formatTime(nextHour + 1),
            can_watch_evee: false,
            is_recurring: false,
            recurrence_days: []
        };
    });
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [appointments, setAppointments] = React.useState([]);
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

    // Fetch appointments when component mounts or selected date changes
    React.useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

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
        console.log(`Input changed - ${name}:`, value);
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`/calendar/api/appointments/get/?date=${selectedDate}`, {
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            });
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const data = await response.json();
            console.log('Fetched appointments:', data.appointments);
            setAppointments(data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const getTimePosition = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const startHour = 6; // 6 AM
        const minutesFromStart = totalMinutes - (startHour * 60);
        return (minutesFromStart / 60) * timeSlotHeight;
    };

    const getAppointmentHeight = (startTime, endTime) => {
        const startPos = getTimePosition(startTime);
        const endPos = getTimePosition(endTime);
        return endPos - startPos;
    };

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const detectOverlaps = (appointments) => {
        const overlaps = new Set();
        const sortedAppointments = [...appointments].sort((a, b) => {
            const aStart = new Date(`2000-01-01T${a.start_time}`);
            const bStart = new Date(`2000-01-01T${b.start_time}`);
            return aStart - bStart;
        });

        for (let i = 0; i < sortedAppointments.length; i++) {
            for (let j = i + 1; j < sortedAppointments.length; j++) {
                const a = sortedAppointments[i];
                const b = sortedAppointments[j];
                
                const aStart = new Date(`2000-01-01T${a.start_time}`);
                const aEnd = new Date(`2000-01-01T${a.end_time}`);
                const bStart = new Date(`2000-01-01T${b.start_time}`);
                const bEnd = new Date(`2000-01-01T${b.end_time}`);

                if (aStart < bEnd && bStart < aEnd) {
                    overlaps.add(a.id);
                    overlaps.add(b.id);
                }
            }
        }
        return overlaps;
    };

    const handleAppointmentClick = (appointment) => {
        console.log('Appointment clicked:', appointment);
        console.log('Current username:', currentUsername);
        console.log('Appointment user:', appointment.user);
        console.log('Is editable:', appointment.user === currentUsername);
        
        if (appointment.user === currentUsername) {
            setEditingAppointment(appointment);
            setFormData({
                title: appointment.title,
                date: appointment.date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                can_watch_evee: appointment.can_watch_evee,
                is_recurring: appointment.is_recurring || false,
                recurrence_days: appointment.recurrence_days || []
            });
            setShowModal(true);
        }
    };

    const handleDelete = async () => {
        if (!editingAppointment) return;
        
        try {
            const response = await fetch(`/calendar/api/appointments/${editingAppointment.id}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            });
            if (!response.ok) throw new Error('Failed to delete appointment');
            setShowModal(false);
            setEditingAppointment(null);  // Clear the editing state
            setFormData({
                title: currentUsername || '',
                date: new Date().toISOString().split('T')[0],
                start_time: formatTime(new Date().getHours() + 1),
                end_time: formatTime(new Date().getHours() + 2),
                can_watch_evee: false,
                is_recurring: false,
                recurrence_days: []
            });
            fetchAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data before submission:', formData);
        
        // Ensure date is properly formatted
        const formattedDate = new Date(formData.date).toISOString().split('T')[0];
        console.log('Formatted date:', formattedDate);
        
        const submitData = {
            user: currentUsername,
            title: formData.title,
            date: formattedDate,
            start_time: formData.start_time,
            end_time: formData.end_time,
            can_watch_evee: formData.can_watch_evee,
            is_recurring: formData.is_recurring,
            recurrence_days: formData.recurrence_days
        };

        console.log('Submitting appointment data:', submitData);
        console.log('Raw JSON data:', JSON.stringify(submitData));

        try {
            const url = editingAppointment 
                ? `/calendar/api/appointments/${editingAppointment.id}/update/`
                : '/calendar/api/appointments/create/';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(submitData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(errorText);
            }
            
            const data = await response.json();
            console.log('Server response:', data);
            
            setShowModal(false);
            setEditingAppointment(null);
            fetchAppointments();
        } catch (error) {
            console.error('Error details:', error);
            alert(error.message);
        }
    };

    const toggleRecurrenceDay = (day) => {
        setFormData(prev => ({
            ...prev,
            recurrence_days: prev.recurrence_days.includes(day)
                ? prev.recurrence_days.filter(d => d !== day)
                : [...prev.recurrence_days, day]
        }));
    };

    const renderAppointments = () => {
        const overlappingAppointments = detectOverlaps(appointments);
        console.log('Rendering appointments:', appointments);
        
        return appointments.map((appointment, index) => {
            const startPos = getTimePosition(appointment.start_time);
            const height = getAppointmentHeight(appointment.start_time, appointment.end_time);
            const isWestermann = appointment.user === 'a.westermann.19';
            const isOverlapping = overlappingAppointments.has(appointment.id);
            const isEditable = appointment.user === currentUsername;
            
            console.log('Rendering appointment:', {
                id: appointment.id,
                user: appointment.user,
                currentUsername,
                isEditable
            });
            
            return (
                <div
                    key={appointment.id}
                    onClick={() => handleAppointmentClick(appointment)}
                    style={{
                        position: 'absolute',
                        top: `${startPos}px`,
                        left: isWestermann ? '80px' : '50%',
                        width: isWestermann ? 'calc(50% - 85px)' : 'calc(50% - 15px)',
                        height: `${height}px`,
                        backgroundColor: isWestermann ? '#e3f2fd' : '#e8f5e9',
                        border: `1px solid ${isWestermann ? '#90caf9' : '#81c784'}`,
                        borderRadius: '4px',
                        padding: '4px',
                        overflow: 'hidden',
                        zIndex: 10,
                        cursor: isEditable ? 'pointer' : 'default',
                        pointerEvents: 'auto',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ fontWeight: 'bold' }}>{appointment.title}</div>
                    <div style={{ fontSize: '0.8em' }}>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </div>
                    {appointment.can_watch_evee && (
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            fontSize: '1.2em',
                            color: '#f57c00'
                        }}>★</div>
                    )}
                    {appointment.is_recurring && (
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: appointment.can_watch_evee ? '24px' : '4px',
                            fontSize: '1.2em',
                            color: '#1976d2'
                        }}>↻</div>
                    )}
                    {isOverlapping && (
                        <div style={{
                            position: 'absolute',
                            left: '-80px',
                            top: '0',
                            width: '80px',
                            height: '100%',
                            backgroundColor: 'rgba(244, 67, 54, 0.2)',
                            borderLeft: '3px solid #f44336'
                        }} />
                    )}
                </div>
            );
        });
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
            touchAction: 'pan-y pinch-zoom',
            pointerEvents: 'auto'
        }}>
            <div style={{
                width: '100%',
                minHeight: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                boxSizing: 'border-box',
                position: 'relative',
                pointerEvents: 'auto'
            }}>
                {/* User labels */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '80px',
                    width: 'calc(50% - 80px)',
                    textAlign: 'center',
                    padding: '5px',
                    backgroundColor: '#e3f2fd',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 'bold',
                    color: '#1976d2'
                }}>
                    a.westermann.19
                </div>
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    width: 'calc(50% - 10px)',
                    textAlign: 'center',
                    padding: '5px',
                    backgroundColor: '#e8f5e9',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 'bold',
                    color: '#2e7d32'
                }}>
                    Ash
                </div>
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
                {renderAppointments()}
            </div>

            {/* Date selector and navigation */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <button
                    onClick={() => {
                        const currentDate = new Date(selectedDate);
                        currentDate.setDate(currentDate.getDate() - 1);
                        setSelectedDate(currentDate.toISOString().split('T')[0]);
                    }}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ←
                </button>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button
                    onClick={() => {
                        const currentDate = new Date(selectedDate);
                        currentDate.setDate(currentDate.getDate() + 1);
                        setSelectedDate(currentDate.toISOString().split('T')[0]);
                    }}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    →
                </button>
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
                        <h2 style={{ marginTop: 0 }}>
                            {editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
                        </h2>
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
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="is_recurring"
                                        checked={formData.is_recurring}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    Recurring Appointment
                                </label>
                            </div>

                            {formData.is_recurring && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Recur on Days</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleRecurrenceDay(index)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '4px',
                                                    border: `1px solid ${formData.recurrence_days.includes(index) ? '#1976d2' : '#ddd'}`,
                                                    backgroundColor: formData.recurrence_days.includes(index) ? '#1976d2' : 'white',
                                                    color: formData.recurrence_days.includes(index) ? 'white' : '#333',
                                                    cursor: 'pointer',
                                                    minWidth: '100px'
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                <div>
                                    {editingAppointment && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingAppointment(null);
                                        }}
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
                                        {editingAppointment ? 'Save' : 'Create'}
                                    </button>
                                </div>
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
